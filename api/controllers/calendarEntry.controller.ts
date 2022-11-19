import { Request, Response, NextFunction } from "express";
import { CalendarEntry } from "../models/calendarEntry";
import { dayAfter } from "../lib/dateHelpers";

interface CalendarEntryInput {
  eventId: string;
  creatorId: string;
  title: string;
  description: string;
  isAllDay: boolean;
  startTimeUtc: Date;
  endTimeUtc: Date;
}
interface CalendarEntry {
  id: string;
  eventId: string;
  creatorId: string;
  title: string;
  description: string;
  isAllDay: boolean;
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
      isAllDay: false,
      startTimeUtc: today,
      endTimeUtc: dayAfter(today),
    },
    {
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Dog walk",
      description: "Time for Scottie walking",
      isAllDay: false,
      startTimeUtc: today,
      endTimeUtc: dayAfter(today),
    },
    {
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Dog walk",
      description: "Time for Scottie walking",
      isAllDay: false,
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
  const entry = await CalendarEntry.create(req.body as CalendarEntry);
  res.status(201).json(entry);
};

export const getCalendarEntries = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const entries = await CalendarEntry.find();
  res.status(200).json(entries);
};

export const getCalendarEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const entry = await CalendarEntry.findById(id);
  res.status(200).json(entry);
};
