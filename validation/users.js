const Joi = require('joi');

const schemas = {
    userSchema: Joi.object({
        email: Joi.string().min(8).max(50).email().required(),
        name: Joi.string().min(3).max(50).required(),
        username: Joi.string().min(3).max(50).required(),
        password: Joi.string().min(6).max(50).required()
    }),
    usernameSchema: Joi.object({
        username: Joi.string().min(3).max(50).required()
    }),
    emailSchema: Joi.object({
        email: Joi.string().min(8).max(50).email().required()
    }),
    passwordSchema: Joi.object({
        password: Joi.string().min(6).max(50).required()
    }),
    userUpdateSchema: Joi.object({
        name: Joi.string().min(3).max(50).required(),
        username: Joi.string().min(3).max(50).required(),
        bio: Joi.string().min(0).max(250).allow(""),
    }),
    passwordUpdateSchema: Joi.object({
        currentPassword: Joi.string().min(6).max(50).required(),
        password: Joi.string().min(6).max(50).required(),
        conformPassword: Joi.string().min(6).max(50).required()
    })
};

exports.validation = function(schema, body){
    return schemas[schema].validate(body);
};

