const {Socket} = require('../database/socket');
const {Notification} = require('../database/notification');
const { User } = require('../database/users');
const { ObjectID } = require('bson');

module.exports = (server) => {
    const io = require('socket.io')(server, {
        cors: {
            "origin": "*",
            "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
            "preflightContinue": false,
            "optionsSuccessStatus": 204
        }
    });

    io.on('connect', (socket) => {

        socket.on('newConnection', async(userId)=>{
            await Socket.saveSocketId(userId, socket.id);
        });

        socket.on('follow', async(data)=>{
            const {userId, isFollowed} = data;
            const socketIds = await Socket.getSocketId({userId : userId});
            const notificationCount = (await Notification.getNotificationList(ObjectID(userId))).length;
            let me = await Socket.getSocketId({socketIds: socket.id});
            me = await User.getUser({_id: ObjectID(me.userId)});

            if(socketIds && socketIds.socketIds.length>0){
                for(let item of socketIds.socketIds){
                    io.to(item).emit((isFollowed?'followed':'unFollowed'), {username: me.username, notificationCount});
                }
            }
        });

        socket.on('disconnect', async() => {
            await Socket.removeSocketId(socket.id);
        });
    });
};