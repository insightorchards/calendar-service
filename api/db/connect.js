// const { MongoClient } = require("mongodb");
// import * as mongoose from 'mongoose'

// const connectionString = "mongodb://127.0.0.1:27017/calendar-app";

// mongoose.connect(
//   connectionString, 
//   {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}
// )
//   .then(result => app.listen(PORT, () => console.log(`app running on port ${PORT}`)))
//   .catch(err => console.log(err))

// const client = new MongoClient(connectionString, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// let dbConnection;

// module.exports = {
//   connectToDatabase: function (dbName, callback) {
//     return client.connect(function (err, db) {
//       if (err || !db) {
//         return callback(err);
//       }

//       dbConnection = db.db(dbName);
//       console.log(`Successfully connected to MongoDB. DB name ${dbName}`);

//       return callback();
//     });
//   },
//   disconnectDatabase: function () {
//     client.close();
//   },
//   getDb: function () {
//     return dbConnection;
//   },
// };
