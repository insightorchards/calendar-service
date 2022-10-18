import express from "express";
import { connectToDatabase, getDb } from "./db/connect";
import { getCalendarEntries, seedDatabaseWithEntry } from "./controllers/calendarEntry.controller";

const app = express();
const port = 4000;

let db;
connectToDatabase("calendar-app", async () => {
  db = getDb();
});

app.listen(port, () => {
  console.log(`Calendar application is running on port ${port}.`);
});

app.get("/entries", getCalendarEntries);
app.post("/seedDatabase", seedDatabaseWithEntry);

export { app, db }
