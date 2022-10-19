import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date("2017-01-01"));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it("renders correctly", () => {
    const app = render(<App />);
    expect(app.asFragment()).toMatchSnapshot();
  });

  it("shows calander with event input fields", async () => {
    render(<App />);
    expect(await screen.findByText("Month")).toBeVisible();
  });

  describe("events", () => {
    xit("displays correct default values for event inputs on page load", () => {});
    xit("displays event in ui when all inputs are provided valid values", () => {});
    xit("errors when end date is before start date", () => {});
    xit("errors when end time is before start time on the same day", () => {});
  });
});
