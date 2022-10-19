import express from "express";
import { connectToDatabase, getDb } from "./db/connect";
import { getCalendarEntries, seedDatabaseWithEntry } from "./controllers/calendarEntry.controller";
import * as dotenv from 'dotenv'

const app = express();
const port = process.env.NODE_ENV === 'test' ? 4001 : 4000;
dotenv.config()

let db;
const databaseName = process.env.NODE_ENV === 'test' ? 'test-db' : 'calendar-app'
connectToDatabase(databaseName, async () => {
  db = getDb();
});

app.listen(port, () => {
  console.log(`Calendar application is running on port ${port}.`);
});

app.get("/entries", getCalendarEntries);
app.post("/seedDatabase", seedDatabaseWithEntry);

export { app, db }
