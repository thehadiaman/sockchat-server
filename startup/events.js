const {Socket} = require('../database/socket');

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
            let socketIds = await Socket.getSocketId({username : username});
            
            let me = await Socket.getSocketId({socketIds: socket.id});

            if(socketIds && socketIds.socketIds.length>0){
                for(let item of socketIds.socketIds){
                    socket.to(item).emit((isFollowed?'followed':'unFollowed'), me.username);
                }
            }
        });

        socket.on('disconnect', async() => {
            await Socket.removeSocketId(socket.id);
        });
    });
};