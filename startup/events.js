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
        socket.on('new', async(username)=>{
            await Socket.saveSocketId(username, socket.id);
        });

        socket.on('disconnect', async() => {
            await Socket.removeSocketId(socket.id);
        });
    });
};