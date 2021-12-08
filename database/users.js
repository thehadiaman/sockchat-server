const {database} = require("./connection");
const databaseConfig = require('./config.json');
const {userSchema} = require("../schema/users");
const bcrypt = require('bcrypt');
const { ObjectID } = require("bson");

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
                    "passwordReset.time": Date.now(),
                    "passwordReset.try": 0
                }
            }
        );
    },
    resetPassword: async(email, password)=>{
        return database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate(
            {email: email},
            {
                $set: {
                    "password": await bcrypt.hash(password, await bcrypt.genSalt(10))
                },
                $unset: {
                    "passwordReset.code": ""
                }
            }
        );
    },
    makeLinkInvalid: async(email, count)=>{
        if(count>1){
            return database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate(
                {email: email},
                {
                    $unset: {
                        "passwordReset.code": "",
                        "passwordReset.try": ""
                    }
                }
            );
        }
        return database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate(
            {email: email},
            {
                $inc: {
                    "passwordReset.try": 1
                }
            }
        ); 
    },
    updateProfile: async(filter, data)=>{
        return database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate(filter, {
            $set: data
        });
    },
    unsetData: async(filter, data)=>{
        return database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate(filter, {
            $unset: data
        });
    },
    getUsers: (searchString)=>{
        return database().collection(databaseConfig.USER_COLLECTION).aggregate([
            {
                $match: {
                    username: { $regex: `^${searchString}`, $options: "i" }
                }
            }
        ]).toArray();
    },
    handleFollow: async(username, myUsername)=>{
        const user = await database().collection(databaseConfig.USER_COLLECTION).findOne({username: username});
        if(user.followers.includes(myUsername)) {
            database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate({username: username}, {
                $pull:{followers: myUsername}
            });
            database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate({username: myUsername}, {
                $pull:{following: username}
            });
        }else{
            database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate({username: username}, {
                $push:{followers: myUsername}
            });
            database().collection(databaseConfig.USER_COLLECTION).findOneAndUpdate({username: myUsername}, {
                $push:{following: username}
            });
        }
        return true;
    }
};