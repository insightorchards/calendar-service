export const dayAfter = (date) => new Date(date.valueOf() + 1000 * 3600 * 24);

export const yearAfter = (date) => {
  const copiedDate = new Date(date.getTime());
  return new Date(copiedDate.setFullYear(date.getFullYear() + 1));
};

export const getMillisecondsBetween = (startDateUtc, endDateUtc) => {
  const end = new Date(endDateUtc);
  const start = new Date(startDateUtc);
  return end.valueOf() - start.valueOf();
};

export const addMillisecondsToDate = (dateUtc, numMilliseconds) => {
  const date = new Date(dateUtc).valueOf();
  const timeAsMilliseconds = date + numMilliseconds;
  return new Date(timeAsMilliseconds).toISOString();
};
