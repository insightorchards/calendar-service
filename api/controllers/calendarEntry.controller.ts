import { Request, Response, NextFunction } from 'express';
import { CalendarEntry } from '../models/calendarEntry'
import { dayAfter } from '../lib/dateHelpers';

interface CalendarEntryInput {
  eventId: string
  creatorId: string
  title: string
  description: string
  isAllDay: boolean
  startTimeUtc: Date
  endTimeUtc: Date
};
interface CalendarEntry {
  id: string
  eventId: string
  creatorId: string
  title: string
  description: string
  isAllDay: boolean
  startTimeUtc: Date
  endTimeUtc: Date
  createdAt: Date
  updatedAt: Date
};

export const seedDatabaseWithEntry = async (req: Request, res: Response, next: NextFunction) => {
  const today = new Date()
  CalendarEntry.create({
    eventId: "634b339218b3b892b312e5ca",
    creatorId: "424b339218b3b892b312e5cb",
    title: "Birthday party",
    description: "Let's celebrate Janie!",
    isAllDay: false,
    startTimeUtc: today,
    endTimeUtc: dayAfter(today),
  })
  CalendarEntry.create({
    eventId: "634b339218b3b892b312e5ca",
    creatorId: "424b339218b3b892b312e5cb",
    title: "Dog walk",
    description: "Time for Scottie walking",
    isAllDay: false,
    startTimeUtc: today,
    endTimeUtc: dayAfter(today),
  })
  CalendarEntry.create({
    eventId: "634b339218b3b892b312e5ca",
    creatorId: "424b339218b3b892b312e5cb",
    title: "Hike with Bethany",
    description: "Bethany wants to see Mt Tam!",
    isAllDay: false,
    startTimeUtc: today,
    endTimeUtc: dayAfter(today),
  })
  res.sendStatus(201)
  return
}

export const getCalendarEntries = async (req: Request, res: Response, next: NextFunction) => {
  const entries = await CalendarEntry.find();
  res.status(200).json(entries);
};
