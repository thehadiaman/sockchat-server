const jwt = require('jsonwebtoken');
const config = require('config');
const { User } = require('../database/users');

exports.generateJsonWebToken=async(email)=>{
    const user = await User.getUser({email: email});
    const payload = {_id: user._id, name: user.name, email: user.email, code: user.password, valid: user.verification.verified};
    const privateKey = config.get('JSON_PRIVATE_KEY');
    const token = jwt.sign(payload, privateKey);

    return token;
};