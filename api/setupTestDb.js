const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongo = null;
const connectionString = "mongodb://127.0.0.1:27017/test-db";

const connectDB = async () => {
  // some connection seems to be persisting,
  // manually killing for now
  // TODO: set it up so you can delete L11 and mongoose connects properly
  await mongoose.connection.close();
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(connectionString);
};

const dropDB = async () => {
  if (mongo) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
  }
};

const dropCollections = async () => {
  if (mongo) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany();
    }
  }
};

module.exports = { connectDB, dropDB, dropCollections };
