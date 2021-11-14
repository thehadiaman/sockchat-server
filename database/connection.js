const {MongoClient} = require('mongodb');
const config = require('config');

let database;

exports.connect = async function() {
    const uri = config.get('DATABASE_URI');
    const client = new MongoClient(uri);

    await client.connect()
    .then(data=>{
        console.log('Connected to mongodb.');
        database = data.db(config.get('DATABASE_NAME'));
    })
    .catch(err=>{
        console.log('Mongodb connection failed.');
    });
};

exports.database = database;