export const dayAfter = (date: any) =>
  new Date(date.valueOf() + 1000 * 3600 * 24);

export const yearAfter = (date: any) => {
  const copiedDate = new Date(date.getTime());
  return new Date(copiedDate.setFullYear(date.getFullYear() + 1));
};

export const dateMinusMinutes = (date: any, numMinutes: number) => {
  const copiedDate = new Date(date.getTime());
  return new Date(copiedDate.setMinutes(date.getMinutes() - numMinutes));
};

export const datePlusMinutes = (date: any, numMinutes: number) => {
  const copiedDate = new Date(date.getTime());
  return new Date(copiedDate.setMinutes(date.getMinutes() + numMinutes));
};

export const getMillisecondsBetween = (startDateUtc: any, endDateUtc: any) => {
  const end = new Date(endDateUtc);
  const start = new Date(startDateUtc);
  return end.valueOf() - start.valueOf();
};

export const addMillisecondsToDate = (
  dateUtc: any,
  numMilliseconds: number,
) => {
  const date = new Date(dateUtc).valueOf();
  const timeAsMilliseconds = date + numMilliseconds;
  return new Date(timeAsMilliseconds).toISOString();
};
