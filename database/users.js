const {database} = require("./connection");
const databaseConfig = require('./config.json');
const {userSchema} = require("../schema/users");

exports.User = {
    getUser: async (filter)=>{
        return database().collection(databaseConfig.USER_COLLECTION).findOne(filter);
    },
    signup: async (body)=>{
        return database().collection(databaseConfig.USER_COLLECTION).insertOne(
            await userSchema(body)
        );
    },

}