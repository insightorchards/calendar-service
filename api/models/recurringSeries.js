const mongoose = require("mongoose");

const recurringSeriesSchema = new mongoose.Schema(
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
      required: false,
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
    recurring: {
      type: Boolean,
      required: true,
    },
    frequency: {
      type: String,
      required: false,
    },
    recurrenceBegins: {
      type: Date,
      required: false,
    },
    recurrenceEnds: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const RecurringSeries = mongoose.model(
  "RecurringSeries",
  recurringSeriesSchema,
  "recurringSeries",
);

module.exports = { RecurringSeries };
