const app = require('express')();
const config = require('config');
require('express-async-errors');

const {createServer} = require('http');
const server = createServer(app);
const io = require('socket.io')(server, {
    cors: {
        "origin": "*",
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false,
        "optionsSuccessStatus": 204
      }
});

// require('./startup/logging')();
require('./startup/config')();
require('./startup/cors')(app);
require('./startup/database')();
require('./startup/routes')(app);

io.on('connection', (socket) => {
    console.log('New user is connected.');
});

server.listen(config.get('PORT'), ()=>{
    console.log(`Listening on port ${config.get('PORT')}`);
});
