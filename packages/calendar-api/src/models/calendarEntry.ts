const mongoose = require("mongoose");
const { EntryException } = require("./entryException");

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
    recurrenceEndsUtc: {
      type: Date,
      required: false,
    },
    recurrencePattern: {
      type: String,
      required: false,
    },
    frequency: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

calendarEntrySchema.pre("remove", { document: true }, function (next: any) {
  // @ts-ignore
  EntryException.remove({ entryId: this._id }).exec();
  next();
});

const CalendarEntry = mongoose.model(
  "CalendarEntry",
  calendarEntrySchema,
  "calendarEntries",
);

export { CalendarEntry };
