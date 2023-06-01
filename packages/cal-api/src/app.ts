import mongoose from "mongoose";
import {
  createCalendarEntry as createCalendarEntryOld,
  deleteCalendarEntry,
  getCalendarEntries as getCalendarEntriesOld,
  getCalendarEntry,
  seedDatabaseWithEntry,
  updateCalendarEntry,
} from "./controllers/calendarEntries_old";
import { createCalendar } from "./controllers/calendars/createCalendar";

import { createCalendarEntry } from "./controllers/calendarEntries/createCalendarEntry";
import { getCalendarEntries } from "./controllers/calendarEntries/getCalendarEntries";
import { getCalendar } from "./controllers/calendars/getCalendar";

const addCalendarRoutes = async (app: any, dbConnectionString: string) => {
  app.get("/entries", getCalendarEntriesOld);
  app.post("/entries", createCalendarEntryOld);
  app.get("/entries/:id", getCalendarEntry);
  app.patch("/entries/:id", updateCalendarEntry);
  app.delete("/entries/:id", deleteCalendarEntry);
  app.post("/seedDatabase", seedDatabaseWithEntry);
  app.get("/calendars/:id", getCalendar);
  app.post("/calendars", createCalendar);
  app.post("/calendars/:id/entries", createCalendarEntry);
  app.get("/calendars/:id/entries", getCalendarEntries);

  await mongoose
    .connect(dbConnectionString)
    .catch((error) => console.log(error));
};

export { addCalendarRoutes };
