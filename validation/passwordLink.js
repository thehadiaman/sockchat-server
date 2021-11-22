const base64 = require('base-64');
const utf8 = require('utf8');
const { User } = require('../database/users');
const _ = require('lodash');

exports.generatePasswordResetLink = async(filter)=>{
    const user = await User.getUser(filter);
    const payload = JSON.stringify(_.pick(user, ['_id', 'email', 'passwordReset']));
    var bytes = utf8.encode(payload);
    var encoded = base64.encode(bytes);
    return encoded;
};