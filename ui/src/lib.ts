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

export { formatDate, getDateTimeString, padNumberWith0Zero };
