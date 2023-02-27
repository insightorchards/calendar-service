import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { addCalendarRoutes } from "@insightorchards/calendar-api";

const app = express();

app.use(express.json());
app.use(cors());

dotenv.config();

const connectionString = process.env.MONGO_CONNECTION_STRING
const LOCAL_PORT = process.env.NODE_ENV === "test" ? 4001 : 4000;
const FINAL_PORT = process.env.PORT || LOCAL_PORT

const start = async () => {
  try {
    addCalendarRoutes(app, connectionString);
    app.listen(FINAL_PORT, () => console.log(`Server started on port ${FINAL_PORT}`));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

module.exports = { app };
