import mongoose from "mongoose";
import { withIdVirtualField } from "../plugins/withIdVirtualField";
import { EntryException } from "./entryException";

const calendarEntrySchema = new mongoose.Schema(
  {
    // ⚠️ TODO: This field should be deprecated. eventId reference is stored on the calendar itself
    eventId: {
      type: String,
      required: false,
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
  }
);

calendarEntrySchema.plugin(withIdVirtualField);
calendarEntrySchema.pre("remove", { document: true }, function (next: any) {
  // @ts-ignore
  EntryException.remove({ entryId: this._id }).exec();
  next();
});

const CalendarEntry = mongoose.model(
  "CalendarEntryOld",
  calendarEntrySchema,
  "calendarEntries"
);

export { CalendarEntry };
