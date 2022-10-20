import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern");
    //mock this as utc time zone to stay consistent throughout tests
    jest.setSystemTime(new Date("2017-01-01"));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it("renders correctly", () => {
    const app = render(<App />);
    expect(app.asFragment()).toMatchSnapshot();
  });

  it("shows calander", async () => {
    render(<App />);
    expect(await screen.findByText("Month")).toBeVisible();
  });

  describe("events", () => {
    // beforeAll(() => render(<App />)); // this didn't work it may need to be beforeEach instead or something else.
    it("displays correct default values for event inputs on page load", async () => {
      render(<App />);
      expect(await screen.findByLabelText("Start Date")).toHaveValue(
        "2016-12-31"
      );
      expect(await screen.findByLabelText("End Date")).toHaveValue(
        "2016-12-31"
      );
      expect(await screen.findByLabelText("Start Time")).toHaveValue("16:00");
      expect(await screen.findByLabelText("End Time")).toHaveValue("17:00");
    });

    it("displays event in ui when all inputs are provided valid values", async () => {
      render(<App />);
      userEvent.click(await screen.findByLabelText("Title"));
      userEvent.type(
        await screen.findByLabelText("Title"),
        "Berta goes to the baseball game!"
      );
      userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      expect(await screen.findByLabelText("Title")).toHaveAttribute(
        "value",
        ""
      );
      expect(
        screen.getByText("Berta goes to the baseball game!")
      ).toBeVisible();
    });
    xit("errors when end date is before start date", () => {});
    xit("errors when end time is before start time on the same day", () => {});
  });
});
