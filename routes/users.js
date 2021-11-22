const {validation} = require("../validation/users");
const {User} = require("../database/users");
const { sendEmail } = require("../validation/email");
const { generateJsonWebToken } = require("../validation/auth");
const router = require('express').Router();
const auth = require('../middleware/auth');
const valid = require('../middleware/auth');

router.post('/', async(req, res)=>{
    const {error} = validation('userSchema', req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let user = await User.getUser({email: req.body.email});
    if(user) return res.status(400).send("Email already in use");

    user = await User.getUser({username: req.body.username});
    if(user) return res.status(400).send("Username already in use");

    await User.signup(req.body);
    user = await User.getUser({email: req.body.email});
    const emailBody = `<h3>SockChat user verification code is <u>${user.verification.code}</u></h3>`;
    sendEmail(req.body.email, "SockChat email verification", "Verify your email", emailBody);

    res
    .header("x-auth-token", await generateJsonWebToken(req.body.email))
    .header("access-control-expose-header", "x-auth-token")
    .send("User saved.");
});

router.get('/me', [auth, valid], async(req, res)=>{
    const user = await User.getUser({_id: req.user._id});
    res.send('user');
});

router.get('/getVerificationCode', auth, async(req, res)=>{
    let user = req.user;
    if((new Date().getMinutes() - new Date(user.verification.time).getMinutes())<1){
        return res.send('Try after 5 minutes');
    }

    user = await User.getUser({email: user.email});
    const emailBody = `<h1 style=\"text-align:center\"><u>SockChat</u></h1><h4>SockChat verification code, verify your email <u style=\"color:black;\">${user.verification.code}</u></h4>`;
    await User.resetValidationTime(req.user.email);
    sendEmail(req.user.email, "SockChat email verification", "Verify your email", emailBody);
    res.send('Verification code');
});

router.get('/:id', async(req, res)=>{
    const id = req.params.id.toLowerCase();
    const {error: usernameError} = validation('usernameSchema', {username: id});
    const {error: emailError} = validation('emailSchema', {email: id});

    if(usernameError && emailError){
        return res.send(false);
    }else if(usernameError){
        const user = await User.getUser({email: id});
        if(user) return res.send(true);
    }else if(emailError){
        const user = await User.getUser({username: id});
        if(user) return res.send(true);
    }
    res.send(false);
});

router.put('/verification', auth, async(req, res)=>{
    if(req.user.verification.verified) return res.status(400).send('User already verified.');
    if(!req.body.code) return res.status(400).send('Invalid credentials.');

    const user = await User.getUser({email: req.user.email});
    const invalidCode = user.verification.code!==parseInt(req.body.code);
    if(invalidCode){
        await User.invalidVerificationCode(req.user.email, req.user.verification);

        if(req.user.verification.invalid>=2){
            const user = await User.getUser({email: req.user.email});
            const emailBody = `<h1 style=\"text-align:center\"><u>SockChat</u></h1><h4 style=\"color:red;\">You entered invalid verification code for three times, so code changes to <u style=\"color:black;\">${user.verification.code}</u></h4>`;
            sendEmail(req.user.email, "SockChat email verification", "Verify your email", emailBody);
        }
        return res.status(400).send('Invalid code.');
    }

    await User.validVerificationCode(req.user.email);
    res
    .header("x-auth-token", await generateJsonWebToken(req.user.email))
    .header("access-control-expose-header", "x-auth-token")
    .send("User verified.");
});

module.exports = router;