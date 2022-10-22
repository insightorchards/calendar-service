import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date("2022-02-15"));
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
        "2022-02-15",
      );
      expect(await screen.findByLabelText("End Date")).toHaveValue(
        "2022-02-15",
      );
      expect(await screen.findByLabelText("Start Time")).toHaveValue("16:00");
      expect(await screen.findByLabelText("End Time")).toHaveValue("17:00");
    });

    it("displays event in ui when all inputs are provided valid values", async () => {
      render(<App />);
      userEvent.click(await screen.findByLabelText("Title"));
      userEvent.type(
        await screen.findByLabelText("Title"),
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

    it("errors when end date is before start date", async () => {
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
        await screen.findByText("Error: end cannot be before start."),
      ).toBeVisible();
    });

    it.only("errors when end time is before start time on the same day", () => {
      render(<App />);
      expect(screen.getByLabelText("Start Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("End Date")).toHaveValue("2022-02-15");
      // expect(screen.getByLableText("Star Time")).
    });
  });
});
