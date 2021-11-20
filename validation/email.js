const { User } = require("../database/users");
const sgMail = require("@sendgrid/mail");
const config = require('config');

exports.sendEmail = async function(email, subject, text, message){
    const user = await User.getUser({email: email});

    sgMail.setApiKey(config.get('EMAIL_API'));
    const msg = {
        to: user.email,
        from: config.get('EMAIL'),
        subject: subject,
        text: text,
        html: `${message.replace('%code%', user.verification.code)}`,
    };

    return sgMail.send(msg);
};