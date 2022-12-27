export const dayAfter = (date) => new Date(date.valueOf() + 1000 * 3600 * 24);

export const yearAfter = (date) => {
  return new Date(new Date().setFullYear(date.getFullYear() + 1));
};
