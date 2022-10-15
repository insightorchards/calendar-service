import express from 'express';
import { getCalendarEntries } from './controllers/calendarEntry.controller'
import { connectToServer, getDb } from './db/connect'

const app = express();
const port = 4000;

app.listen(port, () => {
  console.log(`Calendar application is running on port ${port}.`);
});

app.get('/entries', getCalendarEntries);
connectToServer()
const database = getDb()

