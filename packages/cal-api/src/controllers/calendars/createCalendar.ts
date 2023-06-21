import { NextFunction, Request, Response } from "express";
import { Calendar } from "../../models/calendar";

type CreateCalendarInputType = {
  eventId: string;
  creatorId: string;
  title?: string;
  description?: string;
};

export const createCalendar = (
  req: Request<{}, {}, CreateCalendarInputType>,
  res: Response,
  _next: NextFunction
) => {
  return Calendar.create(req.body)
    .then((calendar) => {
      res.status(201).send(calendar);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
