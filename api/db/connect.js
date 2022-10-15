const { MongoClient } = require("mongodb");

const connectionString = "mongodb://127.0.0.1:27017";
const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let dbConnection;

module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) {
      if (err || !db) {
        return callback(err);
      }

      dbConnection = db.db("calendar-app");
      console.log("Successfully connected to MongoDB.");

      return callback();
    });
  },

  getDb: function () {
    return dbConnection;
  },
};
