import { NextFunction, Request, Response } from "express";
import { CalendarEntry } from "../../models/calendarEntry";

const getCalendarEntries = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { id: calendarId } = req.params;
    const entries = await CalendarEntry.find()
      .where("calendarId")
      .equals(calendarId);
    res.status(200).json(entries);
  } catch (err) {
    res.status(400);
    res.send({ message: err.message });
  }
};

export { getCalendarEntries };
