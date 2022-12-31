import { Request, Response, NextFunction } from "express";
import { CalendarEntry } from "../models/calendarEntry";
import {
  dayAfter,
  getMillisecondsBetween,
  addMillisecondsToDate,
} from "../lib/dateHelpers";
import mongoose from "mongoose";
import { RRule } from "rrule";

const FREQUENCY_MAPPING = {
  monthly: RRule.MONTHLY,
  weekly: RRule.WEEKLY,
};

type CalendarEntry =
  | NonRecurringEntry
  | RecurringParentEntry
  | RecurringChildEntry;

type NonRecurringEntry = {
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

type RecurringParentEntry = {
  id: string;
  eventId: string;
  creatorId: string;
  title: string;
  description?: string;
  allDay: boolean;
  recurring: true;
  startTimeUtc: Date;
  endTimeUtc: Date;
  frequency: string;
  recurrenceBegins: Date;
  recurrenceEnds: Date;
  createdAt: Date;
  updatedAt: Date;
};

type RecurringChildEntry = {
  id: string;
  eventId: string;
  creatorId: string;
  title: string;
  description?: string;
  allDay: boolean;
  recurring: boolean;
  frequency: string;
  recurrenceBegins: Date;
  recurrenceEnds: Date;
  startTimeUtc: Date;
  endTimeUtc: Date;
  recurringEventId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const isNonRecurringEntry = (entry) => {
  return (entry as NonRecurringEntry).recurring === false;
};

const isRecurringParentEntry = (entry) => {
  return (
    (entry as RecurringParentEntry).recurring === true &&
    entry.recurringEventId === undefined
  );
};

// Not currently used but will be used during future features
const isRecurringChildEntry = (entry) => {
  return (
    (entry as RecurringChildEntry).recurring === true &&
    (entry as RecurringChildEntry).recurringEventId !== undefined
  );
};

const prepRecurringEvents = (entry) => {
  const timeDifference = getMillisecondsBetween(
    entry.startTimeUtc,
    entry.endTimeUtc,
  );
  const rule = new RRule({
    freq: FREQUENCY_MAPPING[entry.frequency],
    dtstart: entry.recurrenceBegins,
    until: entry.recurrenceEnds,
  });
  const recurrences = rule.all().slice(1);
  return recurrences.map((date) => {
    return {
      eventId: entry.eventId,
      creatorId: entry.creatorId,
      title: entry.title,
      description: entry.description,
      allDay: entry.allDay,
      startTimeUtc: date,
      endTimeUtc: addMillisecondsToDate(date, timeDifference),
      recurring: true,
      recurringEventId: entry._id,
      frequency: entry.frequency,
      recurrenceBegins: entry.recurrenceBegins,
      recurrenceEnds: entry.recurrenceEnds,
    };
  });
};

const deleteChildEvents = async (parentEvent) => {
  await CalendarEntry.deleteMany({ recurringEventId: parentEvent._id });
};

export const seedDatabaseWithEntry = async (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const today = new Date();
  await CalendarEntry.insertMany([
    {
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Birthday party",
      description: "Let's celebrate Janie!",
      allDay: false,
      recurring: false,
      startTimeUtc: today,
      endTimeUtc: dayAfter(today),
    },
    {
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Dog walk",
      description: "Time for Scottie walking",
      allDay: false,
      recurring: false,
      startTimeUtc: today,
      endTimeUtc: dayAfter(today),
    },
    {
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Dog walk",
      description: "Time for Scottie walking",
      allDay: false,
      recurring: false,
      startTimeUtc: today,
      endTimeUtc: dayAfter(today),
    },
  ]);

  res.sendStatus(201);
};

export const createCalendarEntry = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const entry = await CalendarEntry.create(req.body as CalendarEntry);
    if (isRecurringParentEntry(entry)) {
      const recurringData = prepRecurringEvents(entry);
      await CalendarEntry.insertMany(recurringData);
    }
    res.status(201).json(entry);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
};

export const getCalendarEntries = async (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const entries: CalendarEntry = await CalendarEntry.find();
    res.status(200).json(entries);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
};

export const getCalendarEntry = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { id } = req.params;
  try {
    const entry = await CalendarEntry.findById(id);
    res.status(200).json(entry);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
};

export const deleteCalendarEntry = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { id } = req.params;
  try {
    const entryToDelete = await CalendarEntry.findById(id);
    if (isRecurringParentEntry(entryToDelete)) {
      await deleteChildEvents(entryToDelete);
    }
    await CalendarEntry.deleteOne({ _id: id });
    res.sendStatus(200);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
};

export const updateCalendarEntry = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { id } = req.params;
  try {
    const originalEntry = await CalendarEntry.findByIdAndUpdate(
      id,
      req.body as CalendarEntry,
    );
    const updatedEntry = await CalendarEntry.findById(id);
    if (
      isNonRecurringEntry(originalEntry) &&
      isRecurringParentEntry(updatedEntry)
    ) {
      const recurringData = prepRecurringEvents(updatedEntry);
      await CalendarEntry.insertMany(recurringData);
    }
    if (
      isRecurringParentEntry(originalEntry) &&
      isNonRecurringEntry(updatedEntry)
    ) {
      deleteChildEvents(updatedEntry);
    }
    if (
      isRecurringParentEntry(originalEntry) &&
      isRecurringParentEntry(updatedEntry)
    ) {
      deleteChildEvents(updatedEntry);
      const recurringData = prepRecurringEvents(updatedEntry);
      await CalendarEntry.insertMany(recurringData);
    }
    res.status(200).json(updatedEntry);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
};
