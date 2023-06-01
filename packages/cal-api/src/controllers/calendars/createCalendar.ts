import { NextFunction, Request, Response } from "express";
import { Calendar } from "../../models/calendar";

type CreateCalendarInputType = {
  eventId: string;
  creatorId: string;
  title?: string;
  description?: string;
};

export const createCalendar = async (
  req: Request<{}, {}, CreateCalendarInputType>,
  res: Response,
  _next: NextFunction
) => {
  try {
    const calendar = await Calendar.create(req.body);
    res.status(201).json(calendar);
  } catch (err) {
    res.status(400).json(err);
    res.send({ message: err.message });
  }
};
