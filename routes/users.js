const {userValidation} = require("../validation/users");
const {User} = require("../database/users");
const { sendEmail } = require("../validation/email");
const router = require('express').Router();

router.post('/', async(req, res)=>{
    const {error} = userValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await User.getUser({email: req.body.email});
    if(user) return res.status(400).send("Email already in use");

    await User.signup(req.body);
    await sendEmail(req.body.email, "SockChat email verification", "Verify your email", "<h3>SockChat user verification code is <u>%code%</u></h3>");

    res.send("User saved.");
});



module.exports = router;