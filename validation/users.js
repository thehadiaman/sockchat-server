const Joi = require('joi');

const userSchema = Joi.object({
    email: Joi.string().min(10).max(60).email().required(),
    username: Joi.string().min(5).max(60).required(),
    name: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).max(100).required()
});

exports.userValidation = function(body){
    return userSchema.validate(body);
}