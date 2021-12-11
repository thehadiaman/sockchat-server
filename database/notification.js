const {database} = require("./connection");
const databaseConfig = require('./config.json');
const { ObjectId } = require("mongodb");

exports.Notification = {
    createNotification: async(username, notification)=>{

        const existNotification = await database().collection(databaseConfig.NOTIFICATION_COLLECTION).findOne({username});
        if(!existNotification){
            database().collection(databaseConfig.NOTIFICATION_COLLECTION).insertOne({
                username,
                notifications: [{_id: new ObjectId(), notification: notification, seen: false}],
            });
        }else{
            database().collection(databaseConfig.NOTIFICATION_COLLECTION).findOneAndUpdate({username}, {
                $push: {notifications: {_id: ObjectId(), notification: notification, seen: false}}
            });
        }

    }
};