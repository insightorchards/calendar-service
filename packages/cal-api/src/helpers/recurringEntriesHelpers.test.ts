import { testRrule } from "./recurringEntriesHelpers";

describe("rrule", () => {
  it('does not shift hours for DST', () => {
    const date = new Date();
    const endDate = new Date("06 July 2023 14:48 UTC");
    expect(testRrule(date, endDate)).toEqual(1)
  })
})
