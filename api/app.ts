import express from "express";
import { connectToServer, getDb } from "./db/connect";
import { getCalendarEntries } from "./controllers/calendarEntry.controller";

const app = express();
const port = 4000;

let db;
connectToServer(async () => {
  db = getDb();
});

app.listen(port, () => {
  console.log(`Calendar application is running on port ${port}.`);
});

app.get("/entries", getCalendarEntries);

export { db }
