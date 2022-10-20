import express from "express";
import { connectToDatabase, getDb } from "./db/connect";
import { getCalendarEntries, seedDatabaseWithEntry } from "./controllers/calendarEntry.controller";
import * as dotenv from 'dotenv'

const app = express();
dotenv.config()

let db;
const databaseName = process.env.NODE_ENV === 'test' ? 'test-db' : 'calendar-app'
connectToDatabase(databaseName, async () => {
  db = getDb();
});

app.get("/entries", getCalendarEntries);
app.post("/seedDatabase", seedDatabaseWithEntry);

export { app, db }
