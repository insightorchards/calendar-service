import moment from "moment";
import { EventInputTransformer, EventInput } from "@fullcalendar/react";

const padNumberWith0Zero: Function = (num: Number): string =>
  num.toString().padStart(2, "0");

const formatDate: Function = (date: Date): string => {
  return [
    date.getFullYear(),
    padNumberWith0Zero(date.getMonth() + 1),
    padNumberWith0Zero(date.getDate()),
  ].join("-");
};

const dateMinusOneDay: Function = (date: Date): Date => {
  // subtract a day from the given date
  date.setDate(date.getDate() - 1);
  return date;
};

const dateFormat = (selectedEventDate: Date) =>
  `${selectedEventDate.toLocaleString("default", {
    weekday: "short",
  })}, ${selectedEventDate.toLocaleString("default", {
    month: "short",
  })} ${selectedEventDate.getDate()}`;

const dateFormatWithYear = (selectedEventDate: Date) => {
  return `${selectedEventDate.toLocaleString("default", {
    weekday: "short",
  })}, ${selectedEventDate.toLocaleString("default", {
    month: "short",
  })} ${selectedEventDate.getDate()} ${selectedEventDate.getFullYear()}`;
};

const timeFormat = (selectedEventDate: Date) =>
  `${selectedEventDate.toLocaleTimeString("default", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

interface FormatModalDateProps {
  startTimeUtc: string;
  endTimeUtc: string;
  allDay: boolean;
}

const modalDateFormat: Function = ({
  startTimeUtc,
  endTimeUtc,
  allDay,
}: FormatModalDateProps) => {
  const start = new Date(startTimeUtc);
  const end = new Date(endTimeUtc);
  const startDate = dateFormat(start);
  const endDate = dateFormat(end);

  if (startDate === endDate && allDay) {
    return `${startDate}`;
  } else if (startDate === endDate) {
    return `${startDate} · ${timeFormat(start)} - ${timeFormat(end)}`;
  } else if (allDay) {
    return `${startDate} - ${endDate}`;
  } else {
    return `${startDate}, ${timeFormat(start)} - ${endDate}, ${timeFormat(
      end,
    )}`;
  }
};

const singleModalDateFormat: Function = (dateTimeUtc: string) => {
  const date = new Date(dateTimeUtc);
  const formattedDate = dateFormatWithYear(date);
  const formattedTime = timeFormat(date);
  return `${formattedDate}, ${formattedTime}`;
};

const getDateTimeString = (date: string, time: string) => `${date}T${time}`;

const applyTimeToDate = (date: string, time: string) => {
  const dateTime = new Date(date);
  const [hours, mins, _] = time.split(":");
  dateTime.setHours(parseInt(hours), parseInt(mins));
  return dateTime.toISOString();
};

const oneYearLater = (utcString: string) => {
  const newDate = new Date(utcString);

  return new Date(newDate.setFullYear(new Date(utcString).getFullYear() + 1));
};

const addDayToAllDayEvent: EventInputTransformer = (event: EventInput) => {
  if (event.allDay) {
    event.end = moment(event.end).add(1, "days").toDate();
  }
  return event;
};

export {
  addDayToAllDayEvent,
  dateMinusOneDay,
  formatDate,
  getDateTimeString,
  padNumberWith0Zero,
  modalDateFormat,
  dateFormat,
  timeFormat,
  oneYearLater,
  singleModalDateFormat,
  dateFormatWithYear,
  applyTimeToDate,
};
