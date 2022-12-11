const padNumberWith0Zero: Function = (num: Number): string =>
  num.toString().padStart(2, "0");

const formatDate: Function = (date: Date): string => {
  return [
    date.getFullYear(),
    padNumberWith0Zero(date.getMonth() + 1),
    padNumberWith0Zero(date.getDate()),
  ].join("-");
};

const dateFormat = (selectedEventDate: Date) =>
  `${selectedEventDate.toLocaleString("default", {
    weekday: "long",
  })}, ${selectedEventDate.toLocaleString("default", {
    month: "long",
  })} ${selectedEventDate.getDate()}`;

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
    return `${startDate} ${timeFormat(start)} - ${timeFormat(end)}`;
  } else if (allDay) {
    return `${startDate} - ${endDate}`;
  } else {
    return `${startDate} ${timeFormat(start)} - ${endDate} ${timeFormat(end)}`;
  }
};

const getDateTimeString = (date: string, time: string) => `${date}T${time}`;

const formatTime = (utcString: string) =>
  `${padNumberWith0Zero(new Date(utcString).getHours())}:${padNumberWith0Zero(
    new Date(utcString).getMinutes()
  )}`;

export {
  formatDate,
  getDateTimeString,
  padNumberWith0Zero,
  modalDateFormat,
  formatTime,
  dateFormat,
  timeFormat,
};
