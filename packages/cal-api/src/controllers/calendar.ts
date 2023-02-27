import { Request, Response, NextFunction } from "express";
import { CalendarEntry } from "../models/calendarEntry";
import { EntryException } from "../models/entryException";
import { type CalendarEntryType, type NonRecurringEntryType, type RecurringEntryType, } from "../types"
import {
  dayAfter,
  dateMinusMinutes,
  datePlusMinutes,
} from "../helpers/dateHelpers";
import { RRule } from "rrule";
import {
  expandModifiedEntryException,
  findMatchingModifiedExceptions,
  getRecurringEntriesWithinRange,
  expandRecurringEntry
} from "../helpers/entriesHelpers";

const FREQUENCY_MAPPING = {
  monthly: RRule.MONTHLY,
  weekly: RRule.WEEKLY,
  daily: RRule.DAILY,
};

const isRecurringEntry = (entry) => {
  return (entry as RecurringEntryType).recurring === true;
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
    const entry = await CalendarEntry.create(req.body as CalendarEntryType);
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
    const nonRecurringEntries: NonRecurringEntryType[] = await CalendarEntry.find()
      .where("recurring")
      .equals(false)
      .where("startTimeUtc")
      .gte(start)
      .where("endTimeUtc")
      .lte(end);

    const allRecurrences = await getRecurringEntriesWithinRange(start, end)

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
    if (!entryToDelete) {
      throw new Error("Entry to delete is not found");
    }

    if (isRecurringEntry(entryToDelete) && applyToSeries === "false") {
      const existingModifiedExceptions = await findMatchingModifiedExceptions(
        start,
        entryToDelete,
      );
      if (existingModifiedExceptions.length > 0) {
        existingModifiedExceptions[0].remove();
      } else {
        await EntryException.create({
          deleted: true,
          modified: false,
          entryId: entryToDelete._id,
          startTimeUtc: start,
        });
      }
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
        req.body as CalendarEntryType,
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
      const existingModifiedExceptions = await findMatchingModifiedExceptions(
        start,
        entryToUpdate,
      );
      if (existingModifiedExceptions.length > 0) {
        const exceptionToUpdate = existingModifiedExceptions[0];
        exceptionToUpdate.title = req.body.title;
        exceptionToUpdate.description = req.body.description;
        exceptionToUpdate.title = req.body.title;
        exceptionToUpdate.allDay = req.body.allDay;
        exceptionToUpdate.startTimeUtc = req.body.startTimeUtc;
        exceptionToUpdate.endTimeUtc = req.body.endTimeUtc;
        exceptionToUpdate.save();
        const updatedEntry = expandModifiedEntryException(
          exceptionToUpdate,
          entryToUpdate,
        );
        res.status(200).json(updatedEntry);
      } else {
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
      }
    } else {
      const updatedEntry = await CalendarEntry.findByIdAndUpdate(
        id,
        req.body as CalendarEntryType,
        { returnDocument: "after" },
      );
      res.status(200).json(updatedEntry);
    }
  } catch (err) {
    res.status(400);
    res.send({ message: err.message });
  }
};
