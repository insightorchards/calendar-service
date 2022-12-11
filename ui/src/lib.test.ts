import { modalDateFormat } from "./lib";

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
    expect(result).toEqual("Sunday, December 11 06:43 AM - 08:45 AM");
  });

  it("returns days and times with dash in between for different day events", () => {
    const result = modalDateFormat({
      startTimeUtc: "2022-12-11T14:43:37.868Z",
      endTimeUtc: "2022-12-14T16:45:37.868Z",
      allDay: false,
    });
    expect(result).toEqual(
      "Sunday, December 11 06:43 AM - Wednesday, December 14 08:45 AM"
    );
  });
});