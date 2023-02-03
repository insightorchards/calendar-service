import {
  addDayToAllDayEvent,
  modalDateFormat,
  oneYearLater,
  singleModalDateFormat,
  dateFormatWithYear,
  datePlusHours,
} from "./lib";

describe("lib functions", () => {
  describe("modalDateFormat", () => {
    it("returns two dates seperated by a dash for all day events", () => {
      const result = modalDateFormat({
        startTimeUtc: "2022-12-11T14:43:37.868Z",
        endTimeUtc: "2022-12-14T14:43:37.868Z",
        allDay: true,
      });
      expect(result).toEqual("Sun, Dec 11 - Wed, Dec 14");
    });

    it("returns single date when an all day same day event", () => {
      const result = modalDateFormat({
        startTimeUtc: "2022-12-11T14:43:37.868Z",
        endTimeUtc: "2022-12-11T14:45:37.868Z",
        allDay: true,
      });
      expect(result).toEqual("Sun, Dec 11");
    });

    it("returns one day with dashed times for same day events", () => {
      const result = modalDateFormat({
        startTimeUtc: "2022-12-11T14:43:37.868Z",
        endTimeUtc: "2022-12-11T16:45:37.868Z",
        allDay: false,
      });
      expect(result).toEqual("Sun, Dec 11 · 06:43 AM - 08:45 AM");
    });

    it("returns days and times with dash in between for different day events", () => {
      const result = modalDateFormat({
        startTimeUtc: "2022-12-11T14:43:37.868Z",
        endTimeUtc: "2022-12-14T16:45:37.868Z",
        allDay: false,
      });
      expect(result).toEqual("Sun, Dec 11, 06:43 AM - Wed, Dec 14, 08:45 AM");
    });
  });

  describe("dateFormatWithYear", () => {
    it("returns a date with year included", () => {
      const date = new Date("2022-02-15T16:10:00.000Z");
      const result = dateFormatWithYear(date);
      expect(result).toEqual("Tue, Feb 15 2022");
    });
  });

  describe("singleModalDateFormat", () => {
    it("returns a single formatted date with time and year", () => {
      const result = singleModalDateFormat("2022-12-11T14:43:37.868Z");
      expect(result).toEqual("Sun, Dec 11 2022, 06:43 AM");
    });
  });

  describe("addDayToAllDayEvent", () => {
    it("adds one day end date of all day events", () => {
      const event = {
        allDay: true,
        end: new Date("2022-02-15T04:00"),
      };
      const updatedEvent = addDayToAllDayEvent(event);
      expect(updatedEvent.end).toEqual(new Date("2022-02-16T04:00"));
    });

    it("does not modify dates when event is not all day", () => {
      const event = {
        allDay: false,
        end: new Date("2022-02-15T04:00"),
      };
      const updatedEvent = addDayToAllDayEvent(event);
      expect(updatedEvent.end).toEqual(new Date("2022-02-15T04:00"));
    });
  });

  describe("oneYearLater", () => {
    it("returns a date one year in the future", () => {
      const date = new Date("2022-02-15T04:00");

      expect(oneYearLater(date.toUTCString())).toEqual(
        new Date("2023-02-15T04:00"),
      );
    });
  });

  describe("datePlusHours", () => {
    it("returns a date plus `x` hours, where `x` is positive", () => {
      const date = new Date("2022-02-15T04:00");

      expect(datePlusHours(date, 1)).toEqual(new Date("2022-02-15T05:00"));
    });
    it("returns a date plus `x` hours, where `x` is negative", () => {
      const date = new Date("2022-02-15T04:00");

      expect(datePlusHours(date, -2)).toEqual(new Date("2022-02-15T02:00"));
    });
  });
});
