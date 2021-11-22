const config = require('config');

module.exports = function() {
    if(!config.get('PORT')) throw new Error('Environment variable $PORT is not defined');
    if(!config.get('DATABASE_URI')) throw new Error('Environment variable $DB_URI is not defined');
    if(!config.get('DATABASE_NAME')) throw new Error('Environment variable $DB is not defined');
    if(!config.get('EMAIL_API')) throw new Error('Environment variable $EMAIL_API is not defined');
    if(!config.get('EMAIL')) throw new Error('Environment variable $EMAIL is not defined');
    if(!config.get('JSON_PRIVATE_KEY')) throw new Error('Environment variable $PRIVATE_KEY is not defined');
};