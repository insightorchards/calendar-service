export const dayAfter = (date) => new Date(date.valueOf() + 1000 * 3600 * 24);

export const yearAfter = (date) => {
  // EB_TODO: modify this to match front end function
  return new Date(new Date().setFullYear(date.getFullYear() + 1));
};
