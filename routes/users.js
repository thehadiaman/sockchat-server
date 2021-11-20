const {validation} = require("../validation/users");
const {User} = require("../database/users");
const { sendEmail } = require("../validation/email");
const router = require('express').Router();

router.post('/', async(req, res)=>{
    const {error} = validation('userSchema', req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await User.getUser({email: req.body.email});
    if(user) return res.status(400).send("Email already in use");

    await User.signup(req.body);
    await sendEmail(req.body.email, "SockChat email verification", "Verify your email", "<h3>SockChat user verification code is <u>%code%</u></h3>");

    res.send("User saved.");
});

router.get('/:id', async(req, res)=>{
    const id = req.params.id;
    const {error: usernameError} = validation('usernameSchema', {username: id});
    const {error: emailError} = validation('emailSchema', {email: id});

    if(usernameError && emailError){
        return res.status(400).send('Invalid values.');
    }else if(usernameError){
        const user = await User.getUser({email: id});
        if(user) return res.send(true);
    }else if(emailError){
        const user = await User.getUser({username: id});
        if(user) return res.send(true);
    }

    res.send(false);
});

module.exports = router;