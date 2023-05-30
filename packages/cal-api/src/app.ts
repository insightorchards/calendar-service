import mongoose from "mongoose";
import {
  createCalendarEntry,
  deleteCalendarEntry,
  getCalendarEntries,
  getCalendarEntry,
  seedDatabaseWithEntry,
  updateCalendarEntry,
} from "./controllers/calendar";

const addCalendarRoutes = async (app: any, dbConnectionString: string) => {
  app.get("/entries", getCalendarEntries);
  app.post("/entries", createCalendarEntry);
  app.get("/entries/:id", getCalendarEntry);
  app.patch("/entries/:id", updateCalendarEntry);
  app.delete("/entries/:id", deleteCalendarEntry);
  app.post("/seedDatabase", seedDatabaseWithEntry);

  await mongoose
    .connect(dbConnectionString)
    .catch((error) => console.log(error));
};

export { addCalendarRoutes };
