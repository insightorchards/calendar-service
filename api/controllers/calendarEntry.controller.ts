import { Request, Response, NextFunction } from 'express';
import { db } from '../app'

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

export const getCalendarEntries = async (request: Request, response: Response, next: NextFunction) => {
  const entries: CalendarEntry[] = await db
    .collection("calendarEntries")
    .find({})
    .limit(5)
    .toArray();

  const date = new Date()
  // const entries: CalendarEntry[] = [
  //   {
  //     id: "id",
  //     eventId: "eventId",
  //     creatorId: "creatorId",
  //     title: "title",
  //     description: "description",
  //     isAllDay: false,
  //     startTimeUtc: date,
  //     endTimeUtc: date,
  //     createdAt: date,
  //     updatedAt: date,
  //   },
  // ];

  response.status(200).json(entries);
};
