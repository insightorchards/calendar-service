import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { createEntry, deleteEntry, getEntries, getEntry } from "./hooks";
jest.mock("./hooks");

const mockCreateEntry = createEntry as jest.MockedFunction<typeof createEntry>;
const mockGetEntries = getEntries as jest.MockedFunction<typeof getEntries>;
const mockGetEntry = getEntry as jest.MockedFunction<typeof getEntry>;
const mockDeleteEntry = deleteEntry as jest.MockedFunction<typeof deleteEntry>;

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
        description: "The Padres are going to the playoffs!",
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
        description: "The Padres are going to the playoffs!",
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
          description: "The Padres are going to the playoffs!",
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

    it("displays event in ui when all inputs are provided valid values", async () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([
        {
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
          description: "The Padres are going to the playoffs!",
        },
      ]);
      render(<App />);
      expect(mockGetEntries).toHaveBeenCalledTimes(1);
      userEvent.click(screen.getByLabelText("Title"));
      userEvent.type(
        screen.getByLabelText("Title"),
        "Berta goes to the baseball game!"
      );
      userEvent.type(
        screen.getByLabelText("Description"),
        "The Padres are going to the playoffs!"
      );
      userEvent.type(screen.getByLabelText("Start Date"), "02152022");
      userEvent.type(screen.getByLabelText("Start Time"), "08:10");
      userEvent.type(screen.getByLabelText("End Date"), "02152022");
      userEvent.type(screen.getByLabelText("End Time"), "10:10");
      waitFor(() => {
        userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      });

      expect(mockGetEntries).toHaveBeenCalledTimes(2);

      expect(await screen.findByLabelText("Title")).toHaveAttribute(
        "value",
        ""
      );
      expect(
        await screen.findByText("Berta goes to the baseball game!")
      ).toBeVisible();
      expect(mockCreateEntry).toHaveBeenCalledWith({
        startTimeUtc: new Date("2022-02-15T16:10:00.000Z"),
        endTimeUtc: new Date("2022-02-15T18:10:00.000Z"),
        title: "Berta goes to the baseball game!",
        description: "The Padres are going to the playoffs!",
      });
    });

    it("fetches event details when event is clicked", async () => {
      mockGetEntries.mockResolvedValue([
        {
          _id: "123",
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
          description: "The Padres are going to the playoffs!",
        },
        {
          _id: "345",
          end: "2022-02-24T05:43:37.868Z",
          start: "2022-02-24T05:43:37.868Z",
          title: "Dance",
          description: "K-pop Party!",
        },
      ]);

      mockGetEntry.mockResolvedValue([
        {
          _id: "345",
          end: "2022-02-24T05:43:37.868Z",
          start: "2022-02-24T05:43:37.868Z",
          title: "Dance",
          description: "K-pop Party!",
        },
      ]);

      render(<App />);
      expect(mockGetEntries).toHaveBeenCalledTimes(1);
      const eventText = await screen.findByText("Dance");
      expect(eventText).toBeInTheDocument();
      eventText.click();
      expect(mockGetEntry).toHaveBeenCalledTimes(1);
      expect(await screen.findByText("Event Details")).toBeVisible();
    });

    it("deletes entry when delete button is clicked", async () => {
      mockGetEntries.mockResolvedValueOnce([
        {
          _id: "123",
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
          description: "The Padres are going to the playoffs!",
        },
        {
          _id: "345",
          end: "2022-02-24T05:43:37.868Z",
          start: "2022-02-24T05:43:37.868Z",
          title: "Dance",
          description: "fun times",
        },
      ]);

      mockGetEntry.mockResolvedValue({
        _id: "345",
        end: "2022-02-24T05:43:37.868Z",
        start: "2022-02-24T05:43:37.868Z",
        title: "Dance",
        description: "fun times",
      });

      mockDeleteEntry.mockResolvedValue();

      mockGetEntries.mockResolvedValueOnce([
        {
          _id: "123",
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
          description: "The Padres are going to the playoffs!",
        },
      ]);

      render(<App />);
      expect(mockGetEntries).toHaveBeenCalledTimes(1);
      const eventText = await screen.findByText("Dance");
      expect(eventText).toBeInTheDocument();
      eventText.click();
      expect(mockGetEntry).toHaveBeenCalledTimes(1);
      expect(await screen.findByText("Event Details")).toBeVisible();
      expect(await screen.findByText("Event title: Dance")).toBeVisible();
      const deleteButton = await screen.findByText("Delete");
      expect(deleteButton).toBeVisible();
      act(() => {
        deleteButton.click();
        expect(mockDeleteEntry).toHaveBeenCalled();
      });
    });

    it("resets inputs correctly to default values when submitted", () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([
        {
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
          description: "The Padres are going to the playoffs!",
        },
      ]);
      render(<App />);
      // should this check that title and description are reset to empty strings
      userEvent.type(screen.getByLabelText("Start Date"), "03162022");
      userEvent.type(screen.getByLabelText("Start Time"), "08:10");
      userEvent.type(screen.getByLabelText("End Date"), "03182022");
      userEvent.type(screen.getByLabelText("End Time"), "10:10");
      waitFor(() => {
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
      waitFor(() => {
        userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      });
      expect(
        screen.getByText("Error: end cannot be before start.")
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
      waitFor(() => {
        userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      });
      expect(
        screen.getByText("Error: end cannot be before start.")
      ).toBeVisible();
    });
  });
});
