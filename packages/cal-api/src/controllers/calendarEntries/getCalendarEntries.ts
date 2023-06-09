import { NextFunction, Request, Response } from "express";
import { map, reduce } from "ramda";
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

    const findSpec: {
      calendarId: string;
      startTimeUtc?: object;
      endTimeUtc?: object;
    } = { calendarId };

    if (start) findSpec.startTimeUtc = { $gte: start };
    if (end) findSpec.endTimeUtc = { $lte: end };

    const entries: CalendarEntryType[] = await CalendarEntry.find(findSpec);
    const expandedEntries = await Promise.all(
      map(async (entry: CalendarEntryType) => {
        if (entry.recurring) {
          const recurringEntries = await expandRecurringEntry(
            entry,
            start,
            end
          );
          return [...recurringEntries];
        }
        return [entry];
      }, entries)
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
