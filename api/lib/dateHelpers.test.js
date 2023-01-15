const {
  addMillisecondsToDate,
  getMillisecondsBetween,
  yearAfter,
  fiveMinutesBefore,
  fiveMinutesAfter,
} = require("./dateHelpers");

describe("yearAfter", () => {
  it("returns a date one year in the future", () => {
    const date = new Date("05 October 2011 14:48 UTC");
    expect(yearAfter(date)).toEqual(new Date("05 October 2012 14:48 UTC"));
  });
});

describe("fiveMinutesBefore", () => {
  it("returns a date five minutes in the past", () => {
    const date = new Date("05 October 2011 14:02 UTC");
    expect(fiveMinutesBefore(date)).toEqual(
      new Date("05 October 2011 13:57 UTC"),
    );
  });
});

describe("fiveMinutesAfter", () => {
  it("returns a date five minutes in the future", () => {
    const date = new Date("05 October 2011 14:58 UTC");
    expect(fiveMinutesAfter(date)).toEqual(
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
});
