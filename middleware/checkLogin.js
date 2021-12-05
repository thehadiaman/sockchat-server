const jwt = require('jsonwebtoken');
const config = require('config');
const { User } = require('../database/users');

module.exports = async(req, res, next)=>{
    try{
        const decode = jwt.verify(req.header('x-auth-token'), config.get('JSON_PRIVATE_KEY'));
        let user = await User.getUser({email: decode.email, password: decode.code});
        req.user = user;
        next();
    }catch(ex){
        next();
    }
};