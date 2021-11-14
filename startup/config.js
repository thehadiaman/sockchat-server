const config = require('config');

module.exports = function() {
    if(!config.get('PORT')) throw new Error('Environment variable $PORT is not defined');
    if(!config.get('DATABASE_URI')) throw new Error('Environment variable $DB_URI is not defined');
    if(!config.get('DATABASE_NAME')) throw new Error('Environment variable $DB is not defined');
};