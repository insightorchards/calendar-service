import { NextFunction, Request, Response } from "express";
import { updateRecurrenceRule } from "../../helpers/recurringEntriesHelpers";
import { CalendarEntry, CalendarEntryType } from "../../models/calendarEntry";

type CreateCalendarEntryInput =
  | CreateNonRecurringCalendarEntryInput
  | CreateRecurringCalendarEntryInput;

type CreateNonRecurringCalendarEntryInput = {
  calendarId: string;
  creatorId: string;
  title: string;
  description?: string;
  allDay: boolean;
  recurring: false;
  startTimeUtc: Date;
  endTimeUtc: Date;
};

type CreateRecurringCalendarEntryInput = {
  calendarId: string;
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
};

export const createCalendarEntry = async (
  req: Request<{}, {}, CreateCalendarEntryInput>,
  res: Response,
  _next: NextFunction
) => {
  try {
    const entry: CalendarEntryType = await CalendarEntry.create(req.body);
    if (entry.recurring) {
      await updateRecurrenceRule(entry);
    }
    res.status(201).json(entry);
  } catch (err) {
    res.status(400);
    res.send({ message: err.message });
  }
};
