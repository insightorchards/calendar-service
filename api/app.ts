import express from "express";
import mongoose from "mongoose";
// import { connectToDatabase, getDb } from "./db/connect";
import { getCalendarEntries } from "./controllers/calendarEntry.controller";
import * as dotenv from 'dotenv'

const app = express();
app.use(express.json());
dotenv.config()

const connectionString = "mongodb://127.0.0.1:27017/calendar-app";
const PORT = process.env.NODE_ENV === 'test' ? 4001 : 4000;

// mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
// .then(result => app.listen(PORT, () => console.log(`app running on port ${PORT}`)))
// .catch(err => console.log(err))

// let db;
// const databaseName = process.env.NODE_ENV === 'test' ? 'test-db' : 'calendar-app'
// connectToDatabase(databaseName, async () => {
//   db = getDb();
// });

app.get("/entries", getCalendarEntries);
// app.post("/seedDatabase", seedDatabaseWithEntry);

const start = async () => {
  try {
    await mongoose.connect(connectionString);
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

// app.listen(port, () => {
//   console.log(`Calendar application is running on port ${port}.`);
// });

// export { app, db }
