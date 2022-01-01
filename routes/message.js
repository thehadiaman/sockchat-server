const router = require('express').Router();
const auth = require('../middleware/auth');
const valid = require('../middleware/valid');
const {User} = require('../database/users');
const _ = require('lodash');
const { Message } = require('../database/message');

router.post('/send-text-message', [auth, valid], async(req, res)=>{
    if(!req.body.message.users.includes(req.user._id.toHexString())) return res.status(400).send('Invalid user.');
    
    const isUsersExists = await User.findUsersByArray(req.body.message.users);
    if(!isUsersExists) return res.status(400).send('Invalid user..');

    req.message = req.body.message;
    const data = _.pick(req, ['user', 'message']);

    await Message.sendTextMessage(data);

    res.send('message has send.');
});

module.exports = router;