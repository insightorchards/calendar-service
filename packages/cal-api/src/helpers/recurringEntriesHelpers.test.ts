import { testRrule } from "./recurringEntriesHelpers";

describe("test", () => {
  it("returns values", () => {
    const start = new Date("04 March 2023 14:48 UTC");
    const end = new Date("04 April 2023 14:48 UTC");

    expect(testRrule(start, end)).toEqual(1)
  })
})
