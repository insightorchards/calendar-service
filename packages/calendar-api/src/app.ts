import mongoose from "mongoose";
import {
  getCalendarEntries,
  createCalendarEntry,
  seedDatabaseWithEntry,
  getCalendarEntry,
  updateCalendarEntry,
  deleteCalendarEntry,
} from "./controllers/calendar";

const setupMongoose = async (connectionString: string) => {
  await mongoose.connect(connectionString);
};

const addCalendarRoutes = async (app: any, dbConnectionString: string) => {
  await setupMongoose(dbConnectionString);

  app.get("/entries", getCalendarEntries);
  app.post("/entries", createCalendarEntry);
  app.get("/entries/:id", getCalendarEntry);
  app.patch("/entries/:id", updateCalendarEntry);
  app.delete("/entries/:id", deleteCalendarEntry);
  app.post("/seedDatabase", seedDatabaseWithEntry);
};

export { addCalendarRoutes };
