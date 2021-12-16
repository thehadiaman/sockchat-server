const {database} = require("./connection");
const databaseConfig = require('./config.json');
const { ObjectId } = require("mongodb");

exports.Notification = {
    createNotification: async(username, notification, user)=>{

        const existNotification = await database().collection(databaseConfig.NOTIFICATION_COLLECTION).findOne({username});
        if(!existNotification){
            database().collection(databaseConfig.NOTIFICATION_COLLECTION).insertOne({
                username,
                notifications: [{_id: new ObjectId(), notification: notification, seen: false, cause: user}],
            });
        }else{
            database().collection(databaseConfig.NOTIFICATION_COLLECTION).findOneAndUpdate({username}, {
                $push: {notifications: {_id: ObjectId(), notification: notification, seen: false, cause: user}}
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
                $lookup:{
                    from: "users",
                    localField: "notifications.cause",
                    foreignField: "username",
                    as: "user"
                }
            },
            {
                $project:{
                    _id: "$notifications._id",
                    notification: "$notifications.notification",
                    seen: "$notifications.seen",
                    username: "$user.username"
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