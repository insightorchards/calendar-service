import mongoose from "mongoose";

export type CalendarEntryType = NonRecurringEntryType | RecurringEntryType;

export type EntryExceptionType = {
  deleted: boolean;
  modified: boolean;
  entryId: mongoose.Types.ObjectId;
  title?: string;
  description?: string;
  allDay?: boolean;
  startTimeUtc: Date;
  endTimeUtc?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type NonRecurringEntryType = {
  _id: mongoose.Types.ObjectId;
  eventId: string;
  creatorId: string;
  title?: string;
  description?: string;
  allDay?: boolean;
  recurring: boolean;
  startTimeUtc: Date;
  endTimeUtc?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type RecurringEntryType = {
  _id: mongoose.Types.ObjectId;
  eventId: string;
  creatorId: string;
  title?: string;
  description?: string;
  allDay?: boolean;
  recurring: boolean;
  startTimeUtc: Date;
  endTimeUtc?: Date;
  frequency: string;
  recurrenceEndsUtc: Date;
  recurrencePattern: string;
  createdAt: Date;
  updatedAt: Date;
};
