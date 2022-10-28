import { render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern" as FakeTimersConfig);
    const date = new Date("2022-02-15T04:00");
    jest.setSystemTime(date);
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  it("renders correctly", () => {
    const app: any = render(<App />);
    expect(app.asFragment()).toMatchSnapshot();
  });
  it("shows calander", async () => {
    render(<App />);
    expect(await screen.findByText(/Mon/)).toBeVisible();
    expect(await screen.findByText(/Tue/)).toBeVisible();
    expect(await screen.findByText(/Wed/)).toBeVisible();
    expect(await screen.findByText(/Thu/)).toBeVisible();
    expect(await screen.findByText(/Fri/)).toBeVisible();
    expect(await screen.findByText(/Sat/)).toBeVisible();
    expect(await screen.findByText(/Sun/)).toBeVisible();
  });
  describe("events", () => {
    it("defaults to today's date and a one hour time window", () => {
      render(<App />);
      expect(screen.getByLabelText("Start Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("End Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("Start Time")).toHaveValue("04:00");
      expect(screen.getByLabelText("End Time")).toHaveValue("05:00");
    });
    it("displays event in ui when all inputs are provided valid values", async () => {
      render(<App />);
      userEvent.click(screen.getByLabelText("Title"));
      userEvent.type(
        screen.getByLabelText("Title"),
        "Berta goes to the baseball game!",
      );
      userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      expect(await screen.findByLabelText("Title")).toHaveAttribute(
        "value",
        "",
      );
      expect(
        screen.getByText("Berta goes to the baseball game!"),
      ).toBeVisible();
    });
    it("resets inputs correclty to default values when submitted", () => {
      render(<App />);
      userEvent.type(screen.getByLabelText("Start Date"), "2022-03-16");
      userEvent.type(screen.getByLabelText("Start Time"), "08:10");
      userEvent.type(screen.getByLabelText("End Date"), "2022-03-18");
      userEvent.type(screen.getByLabelText("End Time"), "10:10");
      userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      expect(screen.getByLabelText("Start Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("End Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("Start Time")).toHaveValue("04:00");
      expect(screen.getByLabelText("End Time")).toHaveValue("05:00");
    });
    it("errors when end date is before start date", () => {
      render(<App />);
      userEvent.type(screen.getByLabelText("Start Date"), "2016-12-12");
      expect(screen.getByLabelText("Start Date")).toHaveValue("2016-12-12");
      userEvent.type(screen.getByLabelText("End Date"), "2016-11-11");
      expect(screen.getByLabelText("End Date")).toHaveValue("2016-11-11");
      userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      expect(
        screen.getByText("Error: end cannot be before start."),
      ).toBeVisible();
    });
    it("errors when end time is before start time on the same day", () => {
      render(<App />);
      expect(screen.getByLabelText("Start Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("End Date")).toHaveValue("2022-02-15");
      userEvent.type(screen.getByLabelText("Start Time"), "12:00");
      expect(screen.getByLabelText("Start Time")).toHaveValue("12:00");
      userEvent.type(screen.getByLabelText("End Time"), "04:00");
      expect(screen.getByLabelText("End Time")).toHaveValue("04:00");
      userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      expect(
        screen.getByText("Error: end cannot be before start."),
      ).toBeVisible();
    });
  });
});
