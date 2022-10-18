const { MongoClient } = require("mongodb");

const connectionString = "mongodb://127.0.0.1:27017";
const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let dbConnection;

module.exports = {
  connectToDatabase: function (dbName, callback) {
    client.connect(function (err, db) {
      if (err || !db) {
        return callback(err);
      }

      dbConnection = db.db(dbName);
      console.log(`Successfully connected to MongoDB. DB name ${dbName}`);

      return callback();
    });
  },
  disconnectDatabase: function() {
    client.close()
  },
  getDb: function () {
    return dbConnection;
  },
};
