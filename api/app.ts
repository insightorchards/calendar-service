import express from "express";
import { getCalendarEntries } from "./controllers/calendarEntry.controller";
import { connectToServer, getDb } from "./db/connect";

const app = express();
const port = 4000;

let database;
connectToServer(async () => {
  database = getDb();
  const entries = await database
    .collection("calendarEntries")
    .find({})
    .limit(5)
    .toArray();

  console.log(JSON.stringify(entries));
});

app.listen(port, () => {
  console.log(`Calendar application is running on port ${port}.`);
});

app.get("/entries", getCalendarEntries);
