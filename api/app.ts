import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { addCalendarRoutes } from "@insightorchards/calendar-api";

const app = express();

app.use(express.json());
app.use(cors());

dotenv.config();

const connectionString = "mongodb://127.0.0.1:27017/calendar-app";
const PORT = process.env.NODE_ENV === "test" ? 4001 : 4000;

const start = async () => {
  try {
    await addCalendarRoutes(app, connectionString);
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

module.exports = { app };
