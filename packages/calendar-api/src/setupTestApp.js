const express = require("express");
const cors = require("cors");
const { addCalendarRoutes } = require("./app");

const app = express();

app.use(express.json());
app.use(cors());

const connectionString = "mongodb://127.0.0.1:27017/calendar-app";

addCalendarRoutes(app, connectionString);

module.exports = { app };
