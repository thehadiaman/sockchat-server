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
    },
    getNotificationList: (username)=>{
        return database().collection(databaseConfig.NOTIFICATION_COLLECTION).aggregate([
            {
                $match: {username}
            },
            {
                $unwind: '$notifications'
            },
            {
                $match: {"notifications.seen": false}
            }
        ]).toArray();
    },
    getAllNotifications: (username)=>{
        return database().collection(databaseConfig.NOTIFICATION_COLLECTION).aggregate([
            {
                $match: {username}
            },
            {
                $unwind: "$notifications"
            },
            {
                $project: {
                    _id: "$notifications._id",
                    notification: "$notifications.notification",
                    seen: "$notifications.seen"
                }
            }
        ]).toArray();
    },
    removeNotification: (username, notification)=>{
        return database().collection(databaseConfig.NOTIFICATION_COLLECTION).findOneAndUpdate(
            {username},
            {
                $pull: {notifications: notification}
            }
        );
    }
};