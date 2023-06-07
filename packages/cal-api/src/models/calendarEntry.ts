import mongoose from "mongoose";
import { withIdVirtualField } from "../plugins/withIdVirtualField";
import { EntryException } from "./entryException";

export type CalendarEntryType = NonRecurringEntryType | RecurringEntryType;

export type EntryExceptionType = {
  deleted: boolean;
  modified: boolean;
  entryId: mongoose.Schema.Types.ObjectId;
  title: string;
  description?: string;
  allDay: boolean;
  startTimeUtc: Date;
  endTimeUtc: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type NonRecurringEntryType = {
  _id: mongoose.Types.ObjectId;
  calendarId: string;
  creatorId: string;
  title: string;
  description?: string;
  allDay: boolean;
  recurring: boolean;
  startTimeUtc: Date;
  endTimeUtc: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type RecurringEntryType = {
  _id: mongoose.Types.ObjectId;
  calendarId: string;
  creatorId: string;
  title: string;
  description?: string;
  allDay: boolean;
  recurring: boolean;
  startTimeUtc: Date;
  endTimeUtc: Date;
  frequency: string;
  recurrenceEndsUtc: Date;
  recurrencePattern: string;
  createdAt: Date;
  updatedAt: Date;
};

const calendarEntrySchema = new mongoose.Schema(
  {
    calendarId: {
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
  }
);

calendarEntrySchema.plugin(withIdVirtualField);
calendarEntrySchema.pre("remove", { document: true }, function (next: any) {
  // @ts-ignore
  EntryException.remove({ entryId: this._id }).exec();
  next();
});

const CalendarEntry = mongoose.model(
  "CalendarEntry",
  calendarEntrySchema,
  "calendarEntries"
);

export { CalendarEntry };
