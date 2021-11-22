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
    invalidVerificationCode: (email, invalid)=>{
        if(invalid>=2){
            return database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate(
                {email: email},
                {
                    $set: {"verification.invalid": 0, "verification.code": Math.floor(Math.random()*(999999-100000)+100000)}
                }
            );
        }

        return database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate(
            {email: email},
            {
                $inc: {"verification.invalid": 1}
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
                    "verification.code": ""
                }
            }
        );
    }
};