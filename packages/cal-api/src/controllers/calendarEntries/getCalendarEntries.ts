import { NextFunction, Request, Response } from "express";
import { CalendarEntry } from "../../models/calendarEntry";

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

    const entries = await CalendarEntry.find(findSpec);

    res.status(200).json(entries);
  } catch (err) {
    res.status(400);
    res.send({ message: err.message });
  }
};

export { getCalendarEntries };
