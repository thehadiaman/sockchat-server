const {Socket} = require('../database/socket');
const {Notification} = require('../database/notification');

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

        socket.on('newConnection', async(username)=>{
            await Socket.saveSocketId(username, socket.id);
        });

        socket.on('follow', async(data)=>{
            const {username, isFollowed} = data;
            const socketIds = await Socket.getSocketId({username : username});
            const notificationCount = (await Notification.getNotificationList(username)).length;
            let me = await Socket.getSocketId({socketIds: socket.id});

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