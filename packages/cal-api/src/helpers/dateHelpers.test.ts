import {
  addMillisecondsToDate,
  getMillisecondsBetween,
  yearAfter,
  dateMinusMinutes,
  datePlusMinutes,
  getTimeFromDate,
  setTimeForDate
} from "./dateHelpers";

describe("yearAfter", () => {
  it("returns a date one year in the future", () => {
    const date = new Date("05 October 2011 14:48 UTC");
    expect(yearAfter(date)).toEqual(new Date("05 October 2012 14:48 UTC"));
  });
});

describe("dateMinusMinutes", () => {
  it("returns a date five minutes in the past", () => {
    const date = new Date("05 October 2011 14:02 UTC");
    expect(dateMinusMinutes(date, 5)).toEqual(
      new Date("05 October 2011 13:57 UTC"),
    );
  });
});

describe("datePlusMinutes", () => {
  it("returns a date five minutes in the future", () => {
    const date = new Date("05 October 2011 14:58 UTC");
    expect(datePlusMinutes(date, 5)).toEqual(
      new Date("05 October 2011 15:03 UTC"),
    );
  });
});

describe("getMillisecondsBetween", () => {
  it("returns number of minutes between two dates", () => {
    const startDate = new Date("05 October 2011 14:48 UTC").toISOString();
    const endDate = new Date("05 October 2011 15:48 UTC").toISOString();

    expect(getMillisecondsBetween(startDate, endDate)).toEqual(3600000);
  });
});

describe("addMillisecondsToDate", () => {
  it("adds correct amount of time to given date", () => {
    const date = new Date("05 October 2011 14:48 UTC").toISOString();
    expect(addMillisecondsToDate(date, 3600000)).toEqual(
      new Date("05 October 2011 15:48 UTC").toISOString(),
    );
  });

  describe("getTimeFromDate", () => {
    it("returns hours and minutes of date", () => {
      const date = new Date("05 October 2011 14:48 UTC").toISOString()
      expect(getTimeFromDate(date)).toEqual({hours: 14, minutes: 48})
    })
  })

  describe("setTimeForDate", () => {
    it("sets hours and minutes of date", () => {
      const date = new Date("05 October 2011 14:48 UTC").toISOString();
      const expectedDate = new Date("05 October 2011 16:00 UTC")
      expect(setTimeForDate(date, 16, 0)).toEqual(expectedDate)
    })
  })
});
