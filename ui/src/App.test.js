import { render, screen } from "@testing-library/react";
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
    it.only("displays correct default values for event inputs on page load", async () => {
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
      userEvent.click(screen.getByLabelText("Start Date"));
      userEvent.type(screen.getByLabelText("Start Date"), "12122016");
      userEvent.click(screen.getByLabelText("End Date"));
      userEvent.type(screen.getByLabelText("End Date"), "11112016");
      expect(
        screen.getByRole("button", { name: "Create Event" }),
      ).toBeVisible();
      expect(screen.getByText("12/12/2016")).toBeVisible();
      userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      expect(
        await screen.findByText("Error: end cannot be before start."),
      ).toBeVisible();
    });

    xit("errors when end time is before start time on the same day", () => {});
  });
});
