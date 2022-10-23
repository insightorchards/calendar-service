import { Request, Response, NextFunction } from 'express';
import { CalendarEntry } from '../models/calendarEntry'
// import { db } from '../app'

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

const dayAfter = (date) => (new Date((date).valueOf() + 1000*3600*24))

// export const seedDatabaseWithEntry = async (req: Request, res: Response, next: NextFunction) => {
//   const today = new Date()
//   const entries: CalendarEntryInput[] = [
//     {
//       eventId: "634b339218b3b892b312e5ca",
//       creatorId: "424b339218b3b892b312e5cb",
//       title: "Birthday party",
//       description: "Let's celebrate Janie!",
//       isAllDay: false,
//       startTimeUtc: today,
//       endTimeUtc: dayAfter(today),
//     },
//     {
//       eventId: "634b339218b3b892b312e5ca",
//       creatorId: "424b339218b3b892b312e5cb",
//       title: "Dog walk",
//       description: "Time for Scottie walking",
//       isAllDay: false,
//       startTimeUtc: today,
//       endTimeUtc: dayAfter(today),
//     },
//     {
//       eventId: "634b339218b3b892b312e5ca",
//       creatorId: "424b339218b3b892b312e5cb",
//       title: "Hike with Bethany",
//       description: "Bethany wants to see Mt Tam!",
//       isAllDay: false,
//       startTimeUtc: today,
//       endTimeUtc: dayAfter(today),
//     }
//   ]
//   await db.collection('calendarEntries').insert(entries)
//   res.sendStatus(201)
//   return
// }

export const getCalendarEntries = async (req: Request, res: Response, next: NextFunction) => {
  // const entries: CalendarEntry[] = await db
  //   .collection("calendarEntries")
  //   .find({})
  //   .toArray();
  const entries = await CalendarEntry.find();
  res.status(200).json(entries);
};
