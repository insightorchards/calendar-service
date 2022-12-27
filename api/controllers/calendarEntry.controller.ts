import { Request, Response, NextFunction } from "express";
import { CalendarEntry } from "../models/calendarEntry";
import {
  dayAfter,
  getMillisecondsBetween,
  addMillisecondsToDate,
} from "../lib/dateHelpers";
import { RRule, RRuleSet, rrulestr } from "rrule";

// EB_TODO: add recurring fields to this
interface CalendarEntry {
  id: string;
  eventId: string;
  creatorId: string;
  title: string;
  description: string;
  allDay: boolean;
  startTimeUtc: Date;
  endTimeUtc: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const seedDatabaseWithEntry = async (
  _req: Request,
  res: Response,
  _next: NextFunction
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
  _next: NextFunction
) => {
  try {
    const entry = await CalendarEntry.create(req.body as CalendarEntry);
    if (entry.recurring) {
      const timeDifference = getMillisecondsBetween(
        entry.startTimeUtc,
        entry.endTimeUtc
      );
      const rule = new RRule({
        freq: RRule.MONTHLY,
        dtstart: entry.recurrenceBegins,
        until: entry.recurrenceEnds,
      });
      const recurrences = rule.all();
      const recurringData = recurrences.map((date) => {
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
        };
      });
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
  _next: NextFunction
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
  _next: NextFunction
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
  _next: NextFunction
) => {
  const { id } = req.params;
  try {
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
  _next: NextFunction
) => {
  const { id } = req.params;
  try {
    const entry = await CalendarEntry.findByIdAndUpdate(
      id,
      req.body as CalendarEntry
    );
    res.status(200).json(entry);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
};
