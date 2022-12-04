const mongoose = require("mongoose");

const calendarEntrySchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
    },
    creatorId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    allDay: {
      type: Boolean,
      required: true,
    },
    startTimeUtc: {
      type: Date,
      required: true,
    },
    endTimeUtc: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CalendarEntry = mongoose.model(
  "CalendarEntry",
  calendarEntrySchema,
  "calendarEntries"
);

module.exports = { CalendarEntry };
