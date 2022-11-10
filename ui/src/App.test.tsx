import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { createEntry, getEntries } from "./fetchers";
import { act } from "react-dom/test-utils";
jest.mock("./fetchers");

const mockCreateEntry = createEntry as jest.MockedFunction<typeof createEntry>;
const mockGetEntries = getEntries as jest.MockedFunction<typeof getEntries>;

describe("App", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern" as FakeTimersConfig);
    const date = new Date("2022-02-15T04:00");
    jest.setSystemTime(date);
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  it("renders correctly", async () => {
    mockCreateEntry.mockResolvedValue({});
    mockGetEntries.mockResolvedValue([
      {
        end: "2022-02-27T05:43:37.868Z",
        start: "2022-02-27T05:43:37.868Z",
        title: "Berta goes to the baseball game!",
      },
    ]);
    const app: any = render(<App />);
    expect(await screen.findByText(/Mon/)).toBeVisible();
    expect(app.asFragment()).toMatchSnapshot();
  });
  it("shows calander", async () => {
    mockCreateEntry.mockResolvedValue({});
    mockGetEntries.mockResolvedValue([
      {
        end: "2022-02-27T05:43:37.868Z",
        start: "2022-02-27T05:43:37.868Z",
        title: "Berta goes to the baseball game!",
      },
    ]);
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
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([
        {
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
        },
      ]);
      waitFor(() => {
        render(<App />);
      });
      expect(screen.getByLabelText("Start Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("End Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("Start Time")).toHaveValue("04:00");
      expect(screen.getByLabelText("End Time")).toHaveValue("05:00");
    });
    it.only("displays event in ui when all inputs are provided valid values", async () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([
        {
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
        },
      ]);
      render(<App />);
      expect(mockGetEntries).toHaveBeenCalledTimes(1);
      userEvent.click(screen.getByLabelText("Title"));
      userEvent.type(
        screen.getByLabelText("Title"),
        "Berta goes to the baseball game!",
      );
      userEvent.type(screen.getByLabelText("Start Date"), "02152022");
      userEvent.type(screen.getByLabelText("Start Time"), "08:10");
      userEvent.type(screen.getByLabelText("End Date"), "02152022");
      userEvent.type(screen.getByLabelText("End Time"), "10:10");
      act(() => {
        userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      });

      expect(mockGetEntries).toHaveBeenCalledTimes(2);

      expect(await screen.findByLabelText("Title")).toHaveAttribute(
        "value",
        "",
      );
      expect(
        await screen.findByText("Berta goes to the baseball game!"),
      ).toBeVisible();
      expect(mockCreateEntry).toHaveBeenCalledWith({
        startTimeUtc: new Date("2022-02-15T16:10:00.000Z"),
        endTimeUtc: new Date("2022-02-15T18:10:00.000Z"),
        title: "Berta goes to the baseball game!",
      });
    });
    it("resets inputs correctly to default values when submitted", () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([
        {
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
        },
      ]);
      render(<App />);
      userEvent.type(screen.getByLabelText("Start Date"), "03162022");
      userEvent.type(screen.getByLabelText("Start Time"), "08:10");
      userEvent.type(screen.getByLabelText("End Date"), "03182022");
      userEvent.type(screen.getByLabelText("End Time"), "10:10");
      act(() => {
        userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      });
      expect(screen.getByLabelText("Start Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("End Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("Start Time")).toHaveValue("04:00");
      expect(screen.getByLabelText("End Time")).toHaveValue("05:00");
    });
    it("errors when end date is before start date", () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([
        {
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
        },
      ]);
      render(<App />);
      userEvent.type(screen.getByLabelText("Start Date"), "2016-12-12");
      expect(screen.getByLabelText("Start Date")).toHaveValue("2016-12-12");
      userEvent.type(screen.getByLabelText("End Date"), "2016-11-11");
      expect(screen.getByLabelText("End Date")).toHaveValue("2016-11-11");
      act(() => {
        userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      });
      expect(
        screen.getByText("Error: end cannot be before start."),
      ).toBeVisible();
    });
    it("errors when end time is before start time on the same day", () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([
        {
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
        },
      ]);
      render(<App />);
      expect(screen.getByLabelText("Start Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("End Date")).toHaveValue("2022-02-15");
      userEvent.type(screen.getByLabelText("Start Time"), "12:00");
      expect(screen.getByLabelText("Start Time")).toHaveValue("12:00");
      userEvent.type(screen.getByLabelText("End Time"), "04:00");
      expect(screen.getByLabelText("End Time")).toHaveValue("04:00");
      act(() => {
        userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      });
      expect(
        screen.getByText("Error: end cannot be before start."),
      ).toBeVisible();
    });
  });
});
