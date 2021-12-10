const {database} = require("./connection");
const databaseConfig = require('./config.json');

exports.Socket = {
    saveSocketId: async(username, socketId)=>{
        const socket = await database().collection(databaseConfig.SOCKET_COLLECTION).findOne({username});
        if(!socket){
            return database().collection(databaseConfig.SOCKET_COLLECTION).insertOne({
                username: username,
                socketIds: [socketId]
            });
        }

        database().collection(databaseConfig.SOCKET_COLLECTION).findOneAndUpdate({username}, {
            $push: {socketIds: socketId}
        });        
    },

    removeSocketId: (socketId)=>{
        database().collection(databaseConfig.SOCKET_COLLECTION).findOneAndUpdate({socketIds: socketId}, {
            $pull: {socketIds: socketId}
        });
    },

    getSocketId: (username)=>{
        return database().collection(databaseConfig.SOCKET_COLLECTION).findOne({username});
    }
};