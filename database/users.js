const {database} = require("./connection");
const databaseConfig = require('./config.json');
const {userSchema} = require("../schema/users");

exports.User = {
    getUser: (filter)=>{
        return database().collection(databaseConfig.USER_COLLECTION).findOne(filter);
    },
    signup: async (body)=>{
        return database().collection(databaseConfig.USER_COLLECTION).insertOne(
            await userSchema(body)
        );
    },
    invalidVerificationCode: (email, verification)=>{

        if(verification.error>=9){
            return database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate(
                {email: email},
                {
                    $set: {"verification.expire": new Date(), "verification.blocked": true}
                }
            );
        }

        if(verification.invalid>=2){
            return database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate(
                {email: email},
                {
                    $set: {"verification.invalid": 0, "verification.code": Math.floor(Math.random()*(999999-100000)+100000)},
                    $inc: {
                        "verification.error": 1
                    }
                }
            );
        }

        return database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate(
            {email: email},
            {
                $inc: {"verification.invalid": 1, "verification.error": 1}
            }
        );
    },
    validVerificationCode: (email)=>{
        return database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate(
            {email: email},
            {
                $set: {
                    "verification.verified": true
                },
                $unset: {
                    "verification.invalid": "",
                    "verification.error": "",
                    "verification.code": "",
                    "verification.time": "",
                    "verification.blocked": "",
                    "verification.expire": "",
                }
            }
        );
    },
    resetValidationTime: (email)=>{
        return database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate(
            {email: email},
            {
                $set: {
                    "verification.time": Date.now()
                }
            }
        );
    },
    generatePasswordResetCode: (filter)=>{
        return database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate(
            filter,
            {
                $set: {
                    "passwordReset.code": Math.floor(Math.random()*(999999-100000)+100000),
                    "passwordReset.time": Date.now()
                }
            }
        );
    }
};