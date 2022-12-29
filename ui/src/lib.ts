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

const formatDateMinusOneDay: Function = (date: Date): string => {
  // subtract a day from the given date
  date.setDate(date.getDate() - 1);
  return [
    date.getFullYear(),
    padNumberWith0Zero(date.getMonth() + 1),
    padNumberWith0Zero(date.getDate()),
  ].join("-");
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

const formatTime = (utcString: string) =>
  `${padNumberWith0Zero(new Date(utcString).getHours())}:${padNumberWith0Zero(
    new Date(utcString).getMinutes(),
  )}`;

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

const currentHour: number = new Date().getHours();
const currentMinute: number = new Date().getMinutes();

const DEFAULT_START_TIME: string = `${padNumberWith0Zero(
  currentHour,
)}:${padNumberWith0Zero(currentMinute)}`;

const DEFAULT_END_TIME: string = `${padNumberWith0Zero(
  currentHour + 1,
)}:${padNumberWith0Zero(currentMinute)}`;

const DEFAULT_DATE = formatDate(new Date());

export {
  addDayToAllDayEvent,
  formatDate,
  formatDateMinusOneDay,
  getDateTimeString,
  padNumberWith0Zero,
  modalDateFormat,
  formatTime,
  dateFormat,
  timeFormat,
  oneYearLater,
  singleModalDateFormat,
  dateFormatWithYear,
  DEFAULT_START_TIME,
  DEFAULT_END_TIME,
  DEFAULT_DATE,
};
