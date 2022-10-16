import { Request, Response, NextFunction } from 'express';
import { db } from '../app'


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
  const date = new Date()
  const entry: CalendarEntryInput = {
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Birthday party",
      description: "Let's celebrate Janie!",
      isAllDay: false,
      startTimeUtc: date,
      endTimeUtc: new Date((date).valueOf() + 1000*3600*24),
  }
  await db.collection('calendarEntries').insert(entry)
  res.sendStatus(201)
  return
}

export const getCalendarEntries = async (req: Request, res: Response, next: NextFunction) => {
  const entries: CalendarEntry[] = await db
    .collection("calendarEntries")
    .find({})
    .limit(5)
    .toArray();
  res.status(200).json(entries);
};
