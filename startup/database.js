const {connect} = require('../database/connection');

module.exports = async function() {
    await connect();
};