const jwt = require('jsonwebtoken');
const config = require('config');
const { User } = require('../database/users');

module.exports = async(req, res, next)=>{
    try{
        const decode = jwt.verify(req.header('x-auth-token'), config.get('JSON_PRIVATE_KEY'));
        let user = await User.getUser({email: decode.email, password: decode.code});
        if(!user) return res.status(401).send('Invalid user credentials.');

        if(user.verification.blocked) return res.status(403).send('Account blocked, signup after 24 hours');

        req.user = user;
        next();
    }catch(ex){
        res.status(400).send('Invalid token.');
    }
};