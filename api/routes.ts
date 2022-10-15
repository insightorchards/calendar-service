import { getCalendarEntries } from "./controllers/calendarEntry.controller";
import { app } from "./app";

app.get("/entries", getCalendarEntries);
