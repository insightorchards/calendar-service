export const dayAfter = (date) => new Date(date.valueOf() + 1000 * 3600 * 24);

export const yearAfter = (date) => {
  // EB_TODO: modify this to match front end function
  return new Date(new Date().setFullYear(date.getFullYear() + 1));
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
