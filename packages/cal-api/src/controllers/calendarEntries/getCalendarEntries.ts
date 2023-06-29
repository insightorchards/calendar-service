import { NextFunction, Request, Response } from "express";
import { concat, map, reduce } from "ramda";
import {
  getMillisecondsBetween,
  substractMillisecondsFromDate,
} from "../../helpers/dateHelpers";
import { expandRecurringEntry } from "../../helpers/recurringEntriesHelpers";
import { CalendarEntry } from "../../models/calendarEntry";
import { CalendarEntryType, RecurringEntryType } from "../../types";

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

    const entriesWithinRangeFindSpec = {
      calendarId,
      startTimeUtc: { $gte: start, $lte: end },
    };

    const entriesWithinRange: CalendarEntryType[] = await CalendarEntry.find(
      entriesWithinRangeFindSpec
    );

    const recurringEntriesBeforeRangeStartFindSpec = {
      calendarId,
      recurring: true,
      startTimeUtc: { $lt: start },
      $or: [
        {
          endTimeUtc: {
            $gt: start,
          },
        },
        { recurrenceEndsUtc: { $gt: start } },
      ],
    };

    const recurringEntriesBeforeRange: CalendarEntryType[] =
      await CalendarEntry.find(recurringEntriesBeforeRangeStartFindSpec);

    const expandedEntries = await Promise.all(
      map(async (entry: CalendarEntryType) => {
        if (entry.recurring) {
          if (
            new Date(entry.startTimeUtc).valueOf() <
            new Date(start as string).valueOf()
          ) {
            if (
              new Date(entry.endTimeUtc).valueOf() >=
              new Date(start as string).valueOf()
            ) {
              const expandedRecurringEntries = await expandRecurringEntry(
                entry,
                start,
                end
              );
              return [entry, ...expandedRecurringEntries];
            } else if (
              new Date(entry.endTimeUtc).valueOf() <
                new Date(start as string).valueOf() &&
              new Date(
                (entry as RecurringEntryType).recurrenceEndsUtc
              ).valueOf() >= new Date(start as string).valueOf()
            ) {
              const expandedRecurringEntries = await expandRecurringEntry(
                entry,
                substractMillisecondsFromDate(
                  start,
                  getMillisecondsBetween(entry.startTimeUtc, entry.endTimeUtc)
                ),
                end
              );
              return expandedRecurringEntries;
            }
          } else {
            return expandRecurringEntry(entry, start, end, true);
          }
        } else {
          return [entry];
        }
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
