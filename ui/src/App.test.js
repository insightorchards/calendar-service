import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern");
    const date = new Date("2022-02-15T04:00")
    console.log("date", date)
    jest.setSystemTime(date);
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
    it("defaults to today's date and a one hour time window", () => {
      render(<App />);
      expect(screen.getByLabelText("Start Date")).toHaveValue(
        "2022-02-15",
      );
      expect(screen.getByLabelText("End Date")).toHaveValue(
        "2022-02-15",
      );
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

    it("errors when end date is before start date", () => {
      render(<App />);
      fireEvent.change(screen.getByLabelText("Start Date"), {
        target: { value: "2016-12-12" },
      });
      expect(screen.getByLabelText("Start Date")).toHaveValue("2016-12-12");

      fireEvent.change(screen.getByLabelText("End Date"), {
        target: { value: "2016-11-11" },
      });
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

      fireEvent.change(screen.getByLabelText("Start Time"), {
        target: {
          value: '12:00'
        }
      })
      expect(screen.getByLabelText("Start Time")).toHaveValue('12:00');
      fireEvent.change(screen.getByLabelText("End Time"), {
        target: {
          value: '04:00'
        }
      })
      expect(screen.getByLabelText("End Time")).toHaveValue('04:00');

      userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      expect(
        screen.getByText("Error: end cannot be before start."),
      ).toBeVisible();
    });
  });
});
