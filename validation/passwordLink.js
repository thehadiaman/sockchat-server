const base64 = require('base-64');
const utf8 = require('utf8');
const { User } = require('../database/users');
const _ = require('lodash');
const config = require('config');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('bson');

exports.generatePasswordResetLink = async(filter)=>{
    const user = await User.getUser(filter);
    const payload = JSON.stringify(_.pick(user, ['_id', 'email', 'passwordReset']));
    const bytes = utf8.encode(payload);
    const bs64encoded = base64.encode(bytes);

    const jwtPayload = {payload: bs64encoded};
    const privateKey = config.get('JSON_PRIVATE_KEY');
    const token = jwt.sign(jwtPayload, privateKey);

    return token;
};

exports.validatePasswordResetLink = async(token)=>{
    try{
        const encodedPayload = token;
        const privateKey = config.get('JSON_PRIVATE_KEY');
        const decodedPayload = jwt.verify(encodedPayload, privateKey);

        const bs64bytes = base64.decode(decodedPayload.payload);
        const decoded = utf8.decode(bs64bytes);
        const data = JSON.parse(decoded);

        const filter = {
            _id: ObjectId(data._id),
            email: data.email,
            "passwordReset.code": data.passwordReset.code
        };

        const user = await User.getUser(filter);
        if(!user) return false;

        await User.makeLinkInvalid(user.email, user.passwordReset.try);

        return user;
    }catch (ex){
        return false;
    }
};