import { Request, Response, NextFunction } from "express";
import { CalendarEntry } from "../models/calendarEntry";
import { RecurringSeries } from "../models/recurringSeries";
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

type CalendarEntry = NonRecurringEntry | RecurringEntry;

// not used quite yet, will be used
type RecurringSeries = {
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

type RecurringEntry = {
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

const isRecurringEntry = (entry) => {
  return (entry as RecurringEntry).recurring === true;
};

const prepRecurringEvents = (series) => {
  const timeDifference = getMillisecondsBetween(
    series.startTimeUtc,
    series.endTimeUtc,
  );
  const rule = new RRule({
    freq: FREQUENCY_MAPPING[series.frequency],
    dtstart: series.recurrenceBegins,
    until: series.recurrenceEnds,
  });
  const recurrences = rule.all();
  return recurrences.map((date) => {
    return {
      eventId: series.eventId,
      creatorId: series.creatorId,
      title: series.title,
      description: series.description,
      allDay: series.allDay,
      startTimeUtc: date,
      endTimeUtc: addMillisecondsToDate(date, timeDifference),
      recurring: true,
      recurringEventId: series._id,
      frequency: series.frequency,
      recurrenceBegins: series.recurrenceBegins,
      recurrenceEnds: series.recurrenceEnds,
    };
  });
};

const deleteChildEvents = async (series) => {
  await CalendarEntry.deleteMany({ recurringEventId: series._id });
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
    let entry;
    if (req.body.recurring) {
      const series = await RecurringSeries.create(req.body as RecurringSeries);
      // create the parent
      // copy over the data into the children
      // create the children
      const recurringData = prepRecurringEvents(series);
      const entries = await CalendarEntry.insertMany(recurringData);
      entry = entries[0];
    } else {
      entry = await CalendarEntry.create(req.body as CalendarEntry);
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
    if (isRecurringEntry(entryToDelete)) {
      const series = await RecurringSeries.findById(
        entryToDelete.recurringEventId,
      );
      await deleteChildEvents(series);
      await RecurringSeries.deleteOne({ _id: series._id });
    } else {
      await CalendarEntry.deleteOne({ _id: id });
    }
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
    const originalEntry = await CalendarEntry.findById(id);
    const updatedEntry = req.body;
    let entryToReturn;
    if (isNonRecurringEntry(originalEntry) && isRecurringEntry(updatedEntry)) {
      const series = await RecurringSeries.create(
        updatedEntry as RecurringSeries,
      );
      const recurringData = prepRecurringEvents(series);
      const entries = await CalendarEntry.insertMany(recurringData);
      await CalendarEntry.deleteOne({ _id: id });
      entryToReturn = entries[0];
    } else if (
      isRecurringEntry(originalEntry) &&
      isNonRecurringEntry(updatedEntry)
    ) {
      const series = await RecurringSeries.findById(
        originalEntry.recurringEventId,
      );
      await deleteChildEvents(series);
      await RecurringSeries.deleteOne({ _id: series._id });

      entryToReturn = await CalendarEntry.create(updatedEntry as CalendarEntry);
    } else if (
      isRecurringEntry(originalEntry) &&
      isRecurringEntry(updatedEntry)
    ) {
      const series = await RecurringSeries.findById(
        originalEntry.recurringEventId,
      );

      await deleteChildEvents(series);
      await RecurringSeries.findByIdAndUpdate(
        series._id,
        updatedEntry as RecurringSeries,
      );
      const updatedSeries = await RecurringSeries.findById(series._id);
      const recurringData = prepRecurringEvents(updatedSeries);
      const entries = await CalendarEntry.insertMany(recurringData);
      entryToReturn = entries[0];
    } else {
      entryToReturn = await CalendarEntry.findByIdAndUpdate(
        id,
        req.body as CalendarEntry,
      );
    }
    res.status(200).json(entryToReturn);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
};
