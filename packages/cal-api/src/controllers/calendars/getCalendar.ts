import { NextFunction, Request, Response } from "express";
import { Calendar } from "../../models/calendar";

const getCalendar = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { id } = req.params;
    const calendar = await Calendar.findById(id);
    res.status(200).json(calendar);
  } catch (err) {
    res.status(400);
    res.send({ message: err.message });
  }
};

export { getCalendar };
