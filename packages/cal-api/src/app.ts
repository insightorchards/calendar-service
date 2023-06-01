import mongoose from "mongoose";
import { createCalendar } from "./controllers/calendar";
import {
  createCalendarEntry as createCalendarEntryOld,
  deleteCalendarEntry,
  getCalendarEntries,
  getCalendarEntry,
  seedDatabaseWithEntry,
  updateCalendarEntry,
} from "./controllers/calendarEntries_old";

import { createCalendarEntry } from "./controllers/calendarEntries/createCalendarEntry";

const addCalendarRoutes = async (app: any, dbConnectionString: string) => {
  app.post("/calendars", createCalendar);
  app.get("/entries", getCalendarEntries);
  app.post("/entries", createCalendarEntryOld);
  app.get("/entries/:id", getCalendarEntry);
  app.patch("/entries/:id", updateCalendarEntry);
  app.delete("/entries/:id", deleteCalendarEntry);
  app.post("/seedDatabase", seedDatabaseWithEntry);
  app.post("/calendars/:id/entries", createCalendarEntry);

  await mongoose
    .connect(dbConnectionString)
    .catch((error) => console.log(error));
};

export { addCalendarRoutes };
