const {
    database
} = require('./connection');
const databaseConfig = require('./config.json');
const {
    textMessageSchema,
    chatSchema
} = require('../schema/message');

exports.Message = {

    sendTextMessage: async (data) => {

        const messages = await database().collection(databaseConfig.MESSAGE_COLLECTION).findOne({
            users: {
                $all: data.message.users
            }
        });


        if (!messages) {
            return database().collection(databaseConfig.MESSAGE_COLLECTION).insertOne(chatSchema(data));
        }

        database().collection(databaseConfig.MESSAGE_COLLECTION).findOneAndUpdate({
                users: {$all: data.message.users}
            },

            {
                $push: {
                    messages: textMessageSchema(data)
                },
                $set: {
                    lastMessage: data.message.text
                }
            }
        );

    }

};