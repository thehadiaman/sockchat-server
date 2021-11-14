const {
    createLogger,
    format,
    transports
} = require('winston');
const {
    combine,
    timestamp,
    label,
    prettyPrint
} = format;
require('winston-mongodb');

const logger = createLogger({
    level: 'error',
    format: combine(
        timestamp(),
        prettyPrint()
    ),
    transports: [
        new transports.File({
            filename: 'errorlog.log',
            level: 'error'
        }),
        new transports.Console({
            level: 'error'
        })
    ],
});

module.exports = function () {
    process.on('uncaughtException', (err) => {
        logger.log({
            level: 'error',
            message: err.message
        });
    });

    process.on('unhandledRejection', (err) => {
        logger.log({
            level: 'error',
            message: err.message
        });
    });
};