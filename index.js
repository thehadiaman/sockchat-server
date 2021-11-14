const app = require('express')();
const config = require('config');
require('express-async-errors');

require('./startup/logging')();
require('./startup/config')();
require('./startup/database')();
require('./startup/routes')(app);

app.listen(config.get('PORT'), () => {
    console.log(`Listening in port ${config.get('PORT')}`);
});