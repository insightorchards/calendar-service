import { NextFunction, Request, Response } from "express";
import { andThen, bind, map, pipe, reduce } from "ramda";
import {
  getMillisecondsBetween,
  substractMillisecondsFromDate,
} from "../../helpers/dateHelpers";
import { expandRecurringEntry } from "../../helpers/recurringEntriesHelpers";
import { CalendarEntry } from "../../models/calendarEntry";

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

    const nonRecurringEntriesSpec = {
      calendarId,
      recurring: false,
      $or: [
        {
          startTimeUtc: { $gte: start, $lte: end },
        },
        {
          startTimeUtc: { $lt: start },
          endTimeUtc: { $gt: start },
        },
      ],
    };

    const nonRecurringEntries = await CalendarEntry.find(
      nonRecurringEntriesSpec
    );

    const recurringEntriesWithinRangeSpec = {
      calendarId,
      recurring: true,
      startTimeUtc: { $gte: start, $lte: end },
    };

    const recurringEntriesWithinRange = await CalendarEntry.find(
      recurringEntriesWithinRangeSpec
    ).then(
      pipe(
        map(entry => expandRecurringEntry(entry, start, end, true)),
        bind(Promise.all, Promise),
        andThen(reduce((acc, entries) => acc.concat(entries), []))
      )
    );

    const recurringEntriesBeforeRangeSpec = {
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

    const recurringEntriesBeforeRange = await CalendarEntry.find(
      recurringEntriesBeforeRangeSpec
    ).then(
      pipe(
        map(async entry => {
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
            new Date(entry.recurrenceEndsUtc).valueOf() >=
              new Date(start as string).valueOf()
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
          return [];
        }),
        bind(Promise.all, Promise),
        andThen(reduce((acc, entries) => acc.concat(entries), []))
      )
    );

    res
      .status(200)
      .json([
        ...nonRecurringEntries,
        ...recurringEntriesWithinRange,
        ...recurringEntriesBeforeRange,
      ]);
  } catch (err) {
    res.status(400);
    res.send({ message: err.message });
  }
};

export { getCalendarEntries };
