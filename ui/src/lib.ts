const padNumberWith0Zero: Function = (num: Number): string =>
  num.toString().padStart(2, "0");

const formatDate: Function = (date: Date): string => {
  return [
    date.getFullYear(),
    padNumberWith0Zero(date.getMonth() + 1),
    padNumberWith0Zero(date.getDate()),
  ].join("-");
};

const getDateTimeString = (date: string, time: string) => `${date}T${time}`;

const modalDateFormat = (selectedEventDate: Date) =>
  `${selectedEventDate.toLocaleString("default", {
    weekday: "long",
  })}, ${selectedEventDate.toLocaleString("default", {
    month: "long",
  })} ${selectedEventDate.getDate()}
${selectedEventDate.toLocaleTimeString("default", {
  hour: "2-digit",
  minute: "2-digit",
})}
`;

const allDayDateFormat = (selectedEventDate: Date) =>
  `${selectedEventDate.toLocaleString("default", {
    weekday: "long",
  })}, ${selectedEventDate.toLocaleString("default", {
    month: "long",
  })} ${selectedEventDate.getDate()}
`;

const getModalDate = (allDay: boolean, dateTime: string) => {
  const date = new Date(dateTime);
  return allDay ? allDayDateFormat(date) : modalDateFormat(new Date(date));
};

const formatTime = (utcString: string) =>
  `${padNumberWith0Zero(new Date(utcString).getHours())}:${padNumberWith0Zero(
    new Date(utcString).getMinutes(),
  )}`;

export {
  formatDate,
  getDateTimeString,
  padNumberWith0Zero,
  modalDateFormat,
  getModalDate,
  formatTime,
};
