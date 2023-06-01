import { NextFunction, Request, Response } from "express";
import { Calendar } from "../../models/calendar";

const getCalendars = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    // ⚠️ Q: Should all filters go into req.query? or can it go into req.body also?
    const { eventId } = req.query;
    const filter: { eventId?: string } = {};
    if (eventId) filter.eventId = eventId as string;
    const calendars = await Calendar.find(filter);
    res.status(200).json(calendars);
  } catch (err) {
    res.status(400);
    res.send({ message: err.message });
  }
};

export { getCalendars };
