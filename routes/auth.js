const { generateJsonWebToken } = require('../validation/auth');
const { validation } = require('../validation/users');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { User } = require('../database/users');

router.post('/', async(req, res)=>{
    const id = req.body.id;
    const password = req.body.password;

    if(!(id && password)) return res.status(400).send('Invalid credentials.');

    const {error: usernameError} = validation('usernameSchema', {username: id});
    const {error: emailError} = validation('emailSchema', {email: id});

    let user = {};
    if(usernameError && emailError){
        return res.status(400).send("Invalid credentials.");
    }else if(usernameError){
        user = await User.getUser({email: id.toLowerCase()});
    }else if(emailError){
        user = await User.getUser({username: id.toLowerCase()});
    }
    if(!user) return res.status(400).send('Invalid credentials.');

    const passwordVerification = await bcrypt.compare(password, user.password);
    if(!passwordVerification) return res.status(400).send('Invalid credentials.');

    res
    .header("x-auth-token", await generateJsonWebToken(user.email))
    .header("access-control-expose-headers", "x-auth-token")
    .send("Login successful.");
});

module.exports = router;