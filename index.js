const app = require('express')();
const config = require('config');
require('express-async-errors');
const {createServer} = require('http');
const server = createServer(app);

// require('./startup/logging')();
require('./startup/config')();
require('./startup/cors')(app);
require('./startup/database')();
require('./startup/routes')(app);
require('./startup/events')(server);

server.listen(config.get('PORT'), ()=>{
    console.log(`Listening on port ${config.get('PORT')}`);
});
