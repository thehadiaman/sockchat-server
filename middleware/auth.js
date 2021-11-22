const jwt = require('jsonwebtoken');
const config = require('config');
const { User } = require('../database/users');

module.exports = async(req, res, next)=>{
    try{
        const decode = jwt.decode(req.header('x-auth-token'), config.get('JSON_PRIVATE_KEY'));
        const user = await User.getUser({email: decode.email, password: decode.code});
        if(!user) return res.status(400).send('Invalid user credentials.');

        req.user = user;
        next();
    }catch(ex){
        res.status(400).send('Invalid token.');
    }
};