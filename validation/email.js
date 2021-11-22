const { User } = require("../database/users");
const sgMail = require("@sendgrid/mail");
const config = require('config');

exports.sendEmail = async function(email, subject, text, body){
    sgMail.setApiKey(config.get('EMAIL_API'));
    const msg = {
        to: email,
        from: config.get('EMAIL'),
        subject: subject,
        text: text,
        html: body,
    };

    return sgMail.send(msg);
};