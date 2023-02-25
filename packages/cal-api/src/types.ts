import mongoose from "mongoose";

export type CalendarEntryType = NonRecurringEntry | RecurringEntry;

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

export type NonRecurringEntry = {
  id: string;
  eventId: string;
  creatorId: string;
  title: string;
  description?: string;
  allDay: boolean;
  recurring: false;
  startTimeUtc: Date;
  endTimeUtc: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type RecurringEntry = {
  _id: string;
  eventId: string;
  creatorId: string;
  title: string;
  description?: string;
  allDay: boolean;
  recurring: true;
  startTimeUtc: Date;
  endTimeUtc: Date;
  frequency: string;
  recurrenceEndsUtc: Date;
  recurrencePattern: string;
  createdAt: Date;
  updatedAt: Date;
};
