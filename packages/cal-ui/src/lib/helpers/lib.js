import moment from "moment";

const padNumberWith0Zero = (num) => num.toString().padStart(2, "0");

// Returns a string of the format yyyy-mm-dd
// ex. 2022-01-15
const formatDate = (date) => {
  return [
    date.getFullYear(),
    padNumberWith0Zero(date.getMonth() + 1),
    padNumberWith0Zero(date.getDate()),
  ].join("-");
};

const dateMinusOneDay = (date) => {
  date.setDate(date.getDate() - 1);
  return date;
};

const dateFormat = (date) =>
  `${date.toLocaleString("default", {
    weekday: "short",
  })}, ${date.toLocaleString("default", {
    month: "short",
  })} ${date.getDate()}`;

const dateFormatWithYear = (date) => {
  return `${date.toLocaleString("default", {
    weekday: "short",
  })}, ${date.toLocaleString("default", {
    month: "short",
  })} ${date.getDate()} ${date.getFullYear()}`;
};

const datePlusHours = (date, hours) => {
  date.setHours(date.getHours() + hours);
  return date;
};

// Returns a string in the miltary format hh:mm
// ex. 13:00
const timeFormat = (date) =>
  `${date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

// Returns a string in the format hh:mm (AM/PM)
// ex. 01:00 PM
const timeFormatAmPm = (date) =>
  `${date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

const modalDateFormat = ({ startTimeUtc, endTimeUtc, allDay }) => {
  const start = new Date(startTimeUtc);
  const end = new Date(endTimeUtc);
  const startDate = dateFormat(start);
  const endDate = dateFormat(end);
  if (startDate === endDate && allDay) {
    return `${startDate}`;
  } else if (startDate === endDate) {
    return `${startDate} · ${timeFormatAmPm(start)} - ${timeFormatAmPm(end)}`;
  } else if (allDay) {
    return `${startDate} - ${endDate}`;
  } else {
    return `${startDate}, ${timeFormatAmPm(
      start,
    )} - ${endDate}, ${timeFormatAmPm(end)}`;
  }
};

const singleModalDateFormat = (dateTimeUtc) => {
  const date = new Date(dateTimeUtc);
  const formattedDate = dateFormatWithYear(date);
  const formattedTime = timeFormatAmPm(date);
  return `${formattedDate}, ${formattedTime}`;
};

const getDateTimeString = (date, time) => `${date}T${time}`;

const oneYearLater = (utcString) => {
  const newDate = new Date(utcString);
  return new Date(newDate.setFullYear(new Date(utcString).getFullYear() + 1));
};

const addDayToAllDayEvent = (event) => {
  if (event.allDay) {
    event.end = moment(event.end).add(1, "days").toDate();
  }
  return event;
};

export {
  addDayToAllDayEvent,
  dateFormat,
  dateFormatWithYear,
  dateMinusOneDay,
  datePlusHours,
  formatDate,
  getDateTimeString,
  modalDateFormat,
  oneYearLater,
  padNumberWith0Zero,
  singleModalDateFormat,
  timeFormat,
};
