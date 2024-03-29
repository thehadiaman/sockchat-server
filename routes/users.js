const {validation} = require("../validation/users");
const {User} = require("../database/users");
const { sendEmail } = require("../validation/email");
const { generateJsonWebToken } = require("../validation/auth");
const router = require('express').Router();
const auth = require('../middleware/auth');
const checkLogin = require('../middleware/checkLogin');
const valid = require('../middleware/auth');
const { generatePasswordResetLink, validatePasswordResetLink } = require("../validation/passwordLink");
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { Notification } = require("../database/notification");
const { jsonParser } = require("config/parser");
const { ObjectID } = require("bson");

router.post('/', async(req, res)=>{
    const {error} = validation('userSchema', req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let user = await User.getUser({email: req.body.email});
    if(user) return res.status(400).send("Email already in use");

    user = await User.getUser({username: req.body.username});
    if(user) return res.status(400).send("Username already in use");

    await User.signup(req.body);
    user = await User.getUser({email: req.body.email});
    const emailBody = `<h1 style=\"text-align:center\"><u>SockChat</u></h1><h3>SockChat user verification code is <u>${user.verification.code}</u></h3>`;
    sendEmail(req.body.email, "SockChat email verification", "Verify your email", emailBody);

    res
    .header("x-auth-token", await generateJsonWebToken(req.body.email))
    .header("access-control-expose-headers", "x-auth-token")
    .send("User saved.");
});

router.get('/me', [auth, valid], async(req, res)=>{
    const user = await User.getUser({_id: req.user._id});
    res.send(user);
});

router.get('/getVerificationCode', auth, async(req, res)=>{
    const user = req.user;
    if(req.user.verification.verified) return res.send('Email already verified.');
    if((new Date().getMinutes() - new Date(user.verification.time).getMinutes())<=5){
        return res.send('Try after 5 minutes');
    }

    const emailBody = `<h1 style=\"text-align:center\"><u>SockChat</u></h1><h4>SockChat verification code, verify your email <u style=\"color:black;\">${user.verification.code}</u></h4>`;
    await User.resetValidationTime(req.user.email);
    sendEmail(req.user.email, "SockChat email verification", "Verify your email", emailBody);
    res.send('Verification code has send.');
});

router.get('/getUsers', async(req, res)=>{
    const searchString = req.query.searchString;
    if(!searchString) return res.send([]);

    const users = await User.getUsers(searchString);

    for(let a=0;a<users.length;a++){
        users[a] = _.pick(users[a], ['_id', 'name', 'username']);
    }

    res.send(users);
});

router.get('/getUser/:username', async(req, res)=>{
    const username = req.params.username;
    if(!username) return res.status(400).send({});

    let user = await User.getUser({username: username});
    if(!user) return res.status(400).send({});
    user = _.pick(user, ['_id', 'name', 'bio', 'following', 'followers', 'username', 'posts']);
    res.send(user);
});

router.put('/passwordResetLink', async(req, res)=>{
    let id = req.body.id.toLowerCase();
    if(!id) return res.status(400).send('Invalid credentials.');

    const {error: usernameError} = validation('usernameSchema', {username: id});
    const {error: emailError} = validation('emailSchema', {email: id});

    let user = {};
    if(usernameError && emailError){
        return res.status(400).send("Invalid credentials");
    }else if(usernameError){
        user = await User.getUser({email: id});
        if(!user) return res.status(400).send("Invalid credentials");
    }else if(emailError){
        user = await User.getUser({username: id});
        if(!user) return res.status(400).send("Invalid credentials");
    }

    const time = (user.passwordReset && (new Date().getHours() - new Date(user.passwordReset.time).getHours())<=5);
    if(time) return res.send('Try to reset password after 5 hours.');

    const filter = emailError?{'username': id}: {'email': id};
    await User.generatePasswordResetCode(filter);
    const link = `http://localhost:3000/resetPassword?token=${await generatePasswordResetLink(filter)}`;
    const emailBody = `<h1 style=\"text-align:center\"><u>SockChat</u></h1><h4 style="margin-bottom: 50px">Reset your password with</h4><a href="${link}" style="margin-top: 100px;padding: 20px 40px 20px 40px;background-color: rgb(34, 235, 34);color: black;text-decoration: none;">Reset Password</a>`;
    sendEmail(user.email, "SockChat password reset link", "Reset Password", emailBody);

    res.send('Password reset link has send.');
});

router.put('/validatePasswordResetLink', async(req, res)=>{
    const token = req.query.token;
    if(!token) return res.status(400).send('Token required.');

    const validateToken = await validatePasswordResetLink(token);
    if(!validateToken) return res.status(400).send('Invalid token');

    res.send(true);
});

router.put('/resetPassword', async(req, res)=>{
    const token = req.query.token;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const credentials = token && password && confirmPassword;
    if(!credentials) return res.status(400).send('Invalid credentials.');

    const passwords = password === confirmPassword;
    if(!passwords) return res.status(400).send('Invalid password');

    const {error: passwordValidationError} = validation('passwordSchema', {password: password});
    if(passwordValidationError) return res.status(400).send(passwordValidationError.details[0].message);

    const validateToken = await validatePasswordResetLink(token);
    if(!validateToken) return res.status(400).send('Invalid token');
    
    await User.resetPassword(validateToken.email, password);

    res.send('Password has reset.');
});

router.get('/notification-count', [auth, valid], async(req, res)=>{
    const notifications = await Notification.getNotificationList(req.user._id);
    const countOfNotification = notifications.length;
    res.send(String(countOfNotification));
});

router.get('/get-notifications', [auth, valid], async(req, res)=>{
    const notifications = await Notification.getAllNotifications(req.user._id);
    res.send(notifications);
});

router.get('/checkId/:id', checkLogin, async(req, res)=>{
    const id = req.params.id.toLowerCase();
    const {error: usernameError} = validation('usernameSchema', {username: id});
    const {error: emailError} = validation('emailSchema', {email: id});
    
    if(usernameError&&req.user&&(id===req.user.email)) return res.send(false);
    if(emailError&&req.user&&(id===req.user.username)) return res.send(false);

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
    if(req.user.verification.verified) return res.status(400).send('Email already verified.');
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
    .header("access-control-expose-headers", "x-auth-token")
    .send("User verified.");
});

router.put('/', [auth, valid], async(req, res)=>{
    const body = _.pick(req.body, ['name', 'username', 'bio']);

    const {error} = validation('userUpdateSchema', body);
    if(error) return res.status(400).send(error.details[0].message);

    if(req.user.username!==body.username){
        const user = await User.getUser({username: body.username});
        if(user) return res.status(400).send('Username already in use.');
    }
    
    await User.updateProfile({email: req.user.email}, body);
    res.send('User updated.');
});

router.put('/changePassword', [auth, valid], async(req, res)=>{
    const body = _.pick(req.body, ['currentPassword', 'password', 'conformPassword']);

    const verifyPassword = await bcrypt.compare(body.currentPassword, req.user.password);
    if(!verifyPassword) return res.status(400).send('Invalid password.');

    const conformPassword = body.password===body.conformPassword;
    if(!conformPassword) return res.status(400).send('Password doesn\'t match.');

    const {error} = validation('passwordUpdateSchema', body);
    if(error) return res.status(400).send(error.details[0].message);
    
    await User.updateProfile({email: req.user.email}, {password: await bcrypt.hash(body.password, await bcrypt.genSalt(10))});
    res
    .header("x-auth-token", await generateJsonWebToken(req.user.email))
    .header("access-control-expose-headers", "x-auth-token")
    .send('Password updated.');
});

router.put('/scheduleDelete', [auth, valid], async(req, res)=>{
    const body = _.pick(req.body, ['password']);

    const {error} = validation('passwordSchema', body);
    if(error) return res.status(400).send(error.details[0].message);

    const verifyPassword = await bcrypt.compare(body.password, req.user.password);
    if(!verifyPassword) return res.status(400).send('Invalid password.');

    await User.updateProfile({email: req.user.email}, {"verification.expire": new Date()});

    res.send("Account scheduled to delete after 24 hours.");
});

router.put('/cancelDelete', [auth, valid], async(req, res)=>{
    if(!req.user.verification.expire) return res.send("User is not scheduled to delete");

    await User.unsetData({email: req.user.email}, {"verification.expire": ""});

    res.send("Request to delete your account have been cancelled.");
});

router.put('/handleFollow', [auth, valid], async(req, res)=>{
    if(!req.body._id) return res.status(400).send('User id required.');
    req.body._id = ObjectID(req.body._id);
    req.user._id = ObjectID(req.user._id);

    let user = await User.getUser({_id: req.body._id});
    if(!user) return res.status(400).send('No user found.');

    const followAction = await User.handleFollow(req.body._id, req.user._id);

    const notifications = await Notification.getNotifications(req.body._id);
    const newNotification = `started following by ${req.user.username}`;
    const notification = notifications.find(n=>n.notification===newNotification);

    if(!notification&&followAction==='Followed'){
        await Notification.createNotification(req.body._id, newNotification, req.user._id);
    }else if(followAction==='UnFollowed'){
        await Notification.removeNotification(req.body._id, notification);
    }

    res.send(`${followAction} successfully.`);
});

router.put('/notification-seen', [auth, valid], async(req, res)=>{
    const notificationCount = (await Notification.getNotificationList(ObjectID(req.user._id))).length;
    if(notificationCount===0){
        return res.send('No notification found');
    }

    await Notification.makeNotificationSeen(req.user._id);
    res.send('Notification has been seen by user.');
});

module.exports = router;