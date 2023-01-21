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

const isRecurringEntry = (entry) => {
  return (entry as RecurringEntry).recurring === true;
};

const expandModifiedEntryException = async (
  entryException: EntryException,
  parentCalendarEntry: RecurringEntry,
) => {
  return {
    _id: parentCalendarEntry._id,
    title: entryException.title,
    description: entryException.description,
    allDay: entryException.allDay,
    startTimeUtc: entryException.startTimeUtc,
    endTimeUtc: entryException.endTimeUtc,
    recurring: true,
    eventId: parentCalendarEntry.eventId,
    creatorId: parentCalendarEntry.creatorId,
    frequency: parentCalendarEntry.frequency,
    recurrenceEndsUtc: parentCalendarEntry.recurrenceEndsUtc,
  };
};

const expandRecurringEntry = async (calendarEntry, start, end) => {
  const duration = getMillisecondsBetween(
    calendarEntry.startTimeUtc,
    calendarEntry.endTimeUtc,
  );
  const rule = rrulestr(calendarEntry.recurrencePattern);
  const rruleSet = new RRuleSet();

  rruleSet.rrule(rule);

  const deletedExceptions = await EntryException.find({
    entryId: calendarEntry._id,
    deleted: true,
  });

  deletedExceptions.forEach((exception) => {
    rruleSet.exdate(exception.startTimeUtc);
  });

  const recurrences = rruleSet.between(new Date(start), new Date(end));

  const expandedRecurringEntries = recurrences.map((date) => {
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

  const modifiedExceptions = await EntryException.find({
    entryId: calendarEntry._id,
    modified: true,
  })
    .where("startTimeUtc")
    .gte(start)
    .where("startTimeUtc")
    .lt(end);

  const promises = modifiedExceptions.map(async (exception) => {
    return expandModifiedEntryException(exception, calendarEntry);
  });

  const expandedExceptionEntries = await Promise.all(promises);

  return expandedRecurringEntries.concat(expandedExceptionEntries);
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
      const expandedEntry = await expandRecurringEntry(
        entry,
        oneMinBefore,
        oneMinAfter,
      );
      if (expandedEntry.length > 0) {
        res.status(200).json(expandedEntry[0]);
      } else {
        res.status(200).json({});
      }
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
      entryToDelete.remove();
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
  const { start, applyToSeries } = req.query;
  try {
    const entryToUpdate = await CalendarEntry.findById(id);
    if (isRecurringEntry(entryToUpdate) && applyToSeries === "true") {
      const updatedEntry = await CalendarEntry.findByIdAndUpdate(
        id,
        req.body as CalendarEntry,
        { returnDocument: "after" },
      );
      const rule = new RRule({
        freq: FREQUENCY_MAPPING[updatedEntry.frequency],
        dtstart: updatedEntry.startTimeUtc,
        until: updatedEntry.recurrenceEndsUtc,
      });
      updatedEntry.recurrencePattern = rule.toString();
      updatedEntry.save();
      res.status(200).json(updatedEntry);
    } else if (isRecurringEntry(entryToUpdate) && applyToSeries === "false") {
      await EntryException.create({
        deleted: true,
        modified: false,
        entryId: entryToUpdate._id,
        startTimeUtc: start,
      });

      const updatedEntryException = await EntryException.create({
        deleted: false,
        modified: true,
        entryId: entryToUpdate._id,
        startTimeUtc: req.body.startTimeUtc,
        title: req.body.title,
        description: req.body.description,
        allDay: req.body.allDay,
        endTimeUtc: req.body.endTimeUtc,
      });

      const updatedEntry = expandModifiedEntryException(
        updatedEntryException,
        entryToUpdate,
      );
      res.status(200).json(updatedEntry);
    } else {
      const updatedEntry = await CalendarEntry.findByIdAndUpdate(
        id,
        req.body as CalendarEntry,
        { returnDocument: "after" },
      );
      res.status(200).json(updatedEntry);
    }
  } catch (err) {
    res.status(400);
    res.send({ message: err.message });
  }
};
