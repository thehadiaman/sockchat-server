const {database} = require("./connection");
const databaseConfig = require('./config.json');
const { ObjectId } = require("mongodb");

exports.Notification = {
    createNotification: async(userId, notification, user)=>{

        const existNotification = await database().collection(databaseConfig.NOTIFICATION_COLLECTION).findOne({userId});
        if(!existNotification){
            database().collection(databaseConfig.NOTIFICATION_COLLECTION).insertOne({
                userId,
                notifications: [{_id: new ObjectId(), notification: notification, seen: false, cause: user}],
            });
        }else{
            database().collection(databaseConfig.NOTIFICATION_COLLECTION).findOneAndUpdate({userId}, {
                $push: {notifications: {_id: ObjectId(), notification: notification, seen: false, cause: user}}
            });
        }
    },
    getNotificationList: (userId)=>{
        return database().collection(databaseConfig.NOTIFICATION_COLLECTION).aggregate([
            {
                $match: {userId: userId}
            },
            {
                $unwind: '$notifications'
            },
            {
                $match: {"notifications.seen": false}
            }
        ]).toArray();
    },
    getAllNotifications: (userId)=>{
        return database().collection(databaseConfig.NOTIFICATION_COLLECTION).aggregate([
            {
                $match: {userId}
            },
            {
                $unwind: "$notifications"
            },
            {
                $lookup:{
                    from: "users",
                    localField: "notifications.cause",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $project:{
                    _id: "$notifications._id",
                    notification: "$notifications.notification",
                    seen: "$notifications.seen",
                    cause: { $arrayElemAt: [ "$user.username", 0 ] }
                }
            }
        ]).toArray();
    },
    removeNotification: (userId, notification)=>{
        return database().collection(databaseConfig.NOTIFICATION_COLLECTION).findOneAndUpdate(
            {userId},
            {
                $pull: {notifications: notification}
            }
        );
    }
};