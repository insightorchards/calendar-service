import { Request, Response, NextFunction } from "express";
import { CalendarEntry } from "../models/calendarEntry";
import { EntryException } from "../models/entryException";
import {
  dayAfter,
  getMillisecondsBetween,
  addMillisecondsToDate,
  dateMinusMinutes,
  datePlusMinutes,
} from "../lib/dateHelpers";
import { RRule, RRuleSet, rrulestr } from "rrule";

const FREQUENCY_MAPPING = {
  monthly: RRule.MONTHLY,
  weekly: RRule.WEEKLY,
};

type CalendarEntry = NonRecurringEntry | RecurringEntry;

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
  recurring: true;
  startTimeUtc: Date;
  endTimeUtc: Date;
  frequency: string;
  recurrenceEndsUtc: Date;
  recurrencePattern: string;
  createdAt: Date;
  updatedAt: Date;
};

// not used right now but will be used in the future
const isNonRecurringEntry = (entry) => {
  return (entry as NonRecurringEntry).recurring === false;
};

const isRecurringEntry = (entry) => {
  return (entry as RecurringEntry).recurring === true;
};

const expandRecurringEntry = async (calendarEntry, start, end) => {
  const duration = getMillisecondsBetween(
    calendarEntry.startTimeUtc,
    calendarEntry.endTimeUtc,
  );
  const rule = rrulestr(calendarEntry.recurrencePattern);
  const rruleSet = new RRuleSet();

  rruleSet.rrule(rule);

  const exceptions = await EntryException.find({ entryId: calendarEntry._id });

  exceptions.forEach((exception) => {
    rruleSet.exdate(exception.startTimeUtc);
  });

  const recurrences = rruleSet.between(new Date(start), new Date(end));

  return recurrences.map((date) => {
    return {
      _id: calendarEntry._id,
      eventId: calendarEntry.eventId,
      creatorId: calendarEntry.creatorId,
      title: calendarEntry.title,
      description: calendarEntry.description,
      allDay: calendarEntry.allDay,
      startTimeUtc: date,
      endTimeUtc: addMillisecondsToDate(date, duration),
      recurring: true,
      frequency: calendarEntry.frequency,
      recurrenceEndsUtc: calendarEntry.recurrenceEndsUtc,
    };
  });
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
    if (isRecurringEntry(entry)) {
      const rule = new RRule({
        freq: FREQUENCY_MAPPING[entry.frequency],
        dtstart: entry.startTimeUtc,
        until: entry.recurrenceEndsUtc,
      });
      entry.recurrencePattern = rule.toString();
      entry.save();
    }
    res.status(201).json(entry);
  } catch (err) {
    res.status(400);
    res.send({ message: err.message });
  }
};

export const getCalendarEntries = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const { start, end } = req.query;
    const nonRecurringEntries: NonRecurringEntry[] = await CalendarEntry.find()
      .where("recurring")
      .equals(false)
      .where("startTimeUtc")
      .gte(start)
      .where("endTimeUtc")
      .lte(end);

    const recurringEntriesBeginsWithin: RecurringEntry[] =
      await CalendarEntry.find()
        .where("recurring")
        .equals(true)
        .where("startTimeUtc")
        .gte(start)
        .where("startTimeUtc")
        .lt(end);
    const recurringEntriesBeginsBefore: RecurringEntry[] =
      await CalendarEntry.find()
        .where("recurring")
        .equals(true)
        .where("startTimeUtc")
        .lt(start)
        .where("recurrenceEndsUtc")
        .gt(start);

    const allRecurringEntries = [
      ...recurringEntriesBeginsWithin,
      ...recurringEntriesBeginsBefore,
    ];
    let allRecurrences = [];

    for (const recurringEntry of allRecurringEntries) {
      const expandedEntries = await expandRecurringEntry(
        recurringEntry,
        start,
        end,
      );

      allRecurrences.push(...expandedEntries);
    }

    const allEntries = [...nonRecurringEntries, ...allRecurrences];

    res.status(200).json(allEntries);
  } catch (err) {
    res.status(400);
    res.send({ message: err.message });
  }
};

export const getCalendarEntry = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { id } = req.params;
  const { start } = req.query;
  try {
    const entry = await CalendarEntry.findById(id);
    if (isRecurringEntry(entry)) {
      const startDate = new Date(start as string);
      const oneMinBefore = dateMinusMinutes(startDate, 1);
      const oneMinAfter = datePlusMinutes(startDate, 1);
      const expandedEntry = expandRecurringEntry(
        entry,
        oneMinBefore,
        oneMinAfter,
      );
      res.status(200).json(expandedEntry[0]);
    } else {
      res.status(200).json(entry);
    }
  } catch (err) {
    res.status(400);
    res.send({ message: err.message });
  }
};

export const deleteCalendarEntry = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { id } = req.params;
  const { start, applyToSeries } = req.query;

  try {
    const entryToDelete = await CalendarEntry.findById(id);
    if (isRecurringEntry(entryToDelete) && applyToSeries === "false") {
      await EntryException.create({
        deleted: true,
        modified: false,
        entryId: entryToDelete._id,
        startTimeUtc: start,
      });
    } else {
      await CalendarEntry.deleteOne({ _id: id });
    }
    res.sendStatus(200);
  } catch (err) {
    res.status(400);
    res.send({ message: err.message });
  }
};

export const updateCalendarEntry = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { id } = req.params;
  try {
    await CalendarEntry.findByIdAndUpdate(id, req.body as CalendarEntry);
    const updatedEntry = await CalendarEntry.findById(id);
    res.status(200).json(updatedEntry);
  } catch (err) {
    res.status(400);
    res.send({ message: err.message });
  }
};
