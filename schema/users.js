const bcrypt = require('bcrypt');

exports.userSchema = async function(body) {
    return {
        email: body.email.toLowerCase(),
        name: body.name,
        username: body.username.toLowerCase(),
        password: await bcrypt.hash(body.password, await bcrypt.genSalt(10)),
        verification: {
            verified: false,
            invalid: 0,
            error: 0,
            code: Math.floor(Math.random()*(999999-100000)+100000),
            time: Date.now(),
            blocked: false,
            expire: new Date()
        },
        followers: [],
        following: []
    };
};