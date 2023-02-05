const express = require("express");
const cors = require("cors");
import { addCalendarRoutes } from "./app";

const app = express();

app.use(express.json());
app.use(cors());

const connectionString = "mongodb://127.0.0.1:27017/calendar-app";

addCalendarRoutes(app, connectionString);

export { app };
