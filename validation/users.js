const Joi = require('joi');

const userSchema = Joi.object({
    email: Joi.string().min(8).max(50).email().required(),
    username: Joi.string().alphanum().min(3).max(50).required(),
    name: Joi.string().alphanum().min(3).max(50).required(),
    password: Joi.string().min(6).max(50).required()
});

exports.userValidation = function(body){
    return userSchema.validate(body);
};