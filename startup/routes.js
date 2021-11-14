const user = require('../routes/user');
const error = require('../middleware/error');

module.exports = function (app) {
    app.use('/api/users', user);
    app.use(error);
};