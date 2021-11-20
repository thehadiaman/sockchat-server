const bcrypt = require('bcrypt');

exports.userSchema = async function(body) {
    return {
        email: body.email,
        name: body.name,
        username: body.username,
        password: await bcrypt.hash(body.password, await bcrypt.genSalt(10)),
        verification: {
            verified: false,
            invalid: 0,
            code: Math.floor(Math.random()*(999999-100000)+100000)
        },
        followers: [],
        following: []
    };
};