const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
  url = 'mongodb+srv://ashish:bEsad@22MA@cluster0-mq0zw.mongodb.net/shop?retryWrites=true'
  MongoClient.connect(url, { useNewUrlParser: true })
  .then(client => {
    console.log('Connected');
    _db = client.db();
    callback();
  })
  .catch(e => {
    console.log(e)
    throw e;
  });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw  'No database found!';
}

exports.getDb = getDb;
exports.mongoConnect = mongoConnect;



