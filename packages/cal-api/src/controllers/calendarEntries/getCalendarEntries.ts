import { NextFunction, Request, Response } from "express";
import { concat, map, reduce } from "ramda";
import {
  addMillisecondsToDate,
  substractMillisecondsFromDate,
} from "../../helpers/dateHelpers";
import { expandRecurringEntry } from "../../helpers/recurringEntriesHelpers";
import { CalendarEntry } from "../../models/calendarEntry";
import { CalendarEntryType } from "../../types";

const getCalendarEntries = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { id: calendarId } = req.params;
    const { start, end } = req.query;

    if (!start || !end) {
      res.status(400);
      res.send({ message: "Expected start, end to be passed" });
      return;
    }

    const entriesWithinRangeFindSpec: {
      calendarId: string;
      startTimeUtc: object;
    } = { calendarId, startTimeUtc: { $gte: start, $lte: end } };

    const entriesWithinRange: CalendarEntryType[] = await CalendarEntry.find(
      entriesWithinRangeFindSpec
    );

    const recurringEntriesBeforeRangeStartFindSpec: {
      calendarId: string;
      startTimeUtc?: object;
      endTimeUtc?: object;
      recurring: boolean;
    } = {
      calendarId,
      recurring: true,
      startTimeUtc: { $lt: start },
      endTimeUtc: {
        $gt: start,
      },
    };

    const recurringEntriesBeforeRange: CalendarEntryType[] =
      await CalendarEntry.find(recurringEntriesBeforeRangeStartFindSpec);

    const expandedEntries = await Promise.all(
      map(async (entry: CalendarEntryType) => {
        if (entry.recurring) {
          const recurringEntries = await expandRecurringEntry(
            entry,
            substractMillisecondsFromDate(entry.startTimeUtc, 1),
            addMillisecondsToDate(end, 1)
          );
          return [...recurringEntries];
        }
        return [entry];
      }, concat(entriesWithinRange, recurringEntriesBeforeRange))
    );

    const accumulatedEntries = reduce(
      (acc, entries) => acc.concat(entries),
      [],
      expandedEntries
    );

    res.status(200).json(accumulatedEntries);
  } catch (err) {
    res.status(400);
    res.send({ message: err.message });
  }
};

export { getCalendarEntries };
