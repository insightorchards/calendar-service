import { addDayToAllDayEvent, modalDateFormat } from "./lib";

describe("lib functions", () => {
  describe("modalDateFormat", () => {
    it("returns two dates seperated by a dash for all day events", () => {
      const result = modalDateFormat({
        startTimeUtc: "2022-12-11T14:43:37.868Z",
        endTimeUtc: "2022-12-14T14:43:37.868Z",
        allDay: true,
      });
      expect(result).toEqual("Sunday, December 11 - Wednesday, December 14");
    });

    it("returns single date when an all day same day event", () => {
      const result = modalDateFormat({
        startTimeUtc: "2022-12-11T14:43:37.868Z",
        endTimeUtc: "2022-12-11T14:45:37.868Z",
        allDay: true,
      });
      expect(result).toEqual("Sunday, December 11");
    });

    it("returns one day with dashed times for same day events", () => {
      const result = modalDateFormat({
        startTimeUtc: "2022-12-11T14:43:37.868Z",
        endTimeUtc: "2022-12-11T16:45:37.868Z",
        allDay: false,
      });
      expect(result).toEqual("Sunday, December 11 · 06:43 AM - 08:45 AM");
    });

    it("returns days and times with dash in between for different day events", () => {
      const result = modalDateFormat({
        startTimeUtc: "2022-12-11T14:43:37.868Z",
        endTimeUtc: "2022-12-14T16:45:37.868Z",
        allDay: false,
      });
      expect(result).toEqual(
        "Sunday, December 11, 06:43 AM - Wednesday, December 14, 08:45 AM",
      );
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
});
