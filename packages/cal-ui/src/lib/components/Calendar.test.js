import { act, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import Calendar from "./Calendar";

const mockCreateEntry = jest.fn();
const mockGetEntries = jest.fn();
const mockGetEntry = jest.fn();
const mockDeleteEntry = jest.fn();
const mockUpdateEntry = jest.fn();

describe("Calendar", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern");
    const date = new Date("2022-02-15T04:00");
    jest.setSystemTime(date);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("renders correctly", async () => {
    mockCreateEntry.mockResolvedValue({});
    mockGetEntries.mockResolvedValue([]);
    const app = render(
      <Calendar
        createEntry={mockCreateEntry}
        getEntries={mockGetEntries}
        getEntry={mockGetEntry}
        updateEntry={mockUpdateEntry}
        deleteEntry={mockDeleteEntry}
      />,
    );
    expect(await screen.findByText(/Mon/)).toBeVisible();
    expect(app.asFragment()).toMatchSnapshot();
  });

  it("shows calendar", async () => {
    mockCreateEntry.mockResolvedValue({});
    mockGetEntries.mockResolvedValue([
      {
        end: "2022-02-27T05:43:37.868Z",
        start: "2022-02-27T05:43:37.868Z",
        title: "Berta goes to the baseball game!",
      },
    ]);
    render(
      <Calendar
        createEntry={mockCreateEntry}
        getEntries={mockGetEntries}
        getEntry={mockGetEntry}
        updateEntry={mockUpdateEntry}
        deleteEntry={mockDeleteEntry}
      />,
    );
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
      mockGetEntries.mockResolvedValue([]);
      waitFor(() => {
        render(
          <Calendar
            createEntry={mockCreateEntry}
            getEntries={mockGetEntries}
            getEntry={mockGetEntry}
            updateEntry={mockUpdateEntry}
            deleteEntry={mockDeleteEntry}
          />,
        );
      });
      userEvent.click(screen.getByLabelText("add event"));
      expect(screen.getByLabelText("Start Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("End Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("Start Time")).toHaveValue("05:00");
      expect(screen.getByLabelText("End Time")).toHaveValue("06:00");
    });

    it("displays event in ui when all inputs are provided valid values", async () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([
        {
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
          description: "She had some tasty nachos and margarita!",
        },
      ]);
      await act(async () => {
        await render(
          <Calendar
            createEntry={mockCreateEntry}
            getEntries={mockGetEntries}
            getEntry={mockGetEntry}
            updateEntry={mockUpdateEntry}
            deleteEntry={mockDeleteEntry}
          />,
        );
      });
      expect(mockGetEntries).toHaveBeenCalledTimes(2);
      userEvent.click(screen.getByLabelText("add event"));
      userEvent.click(screen.getByLabelText("Title"));
      userEvent.type(
        screen.getByLabelText("Title"),
        "Berta goes to the baseball game!",
      );
      userEvent.type(
        screen.getByLabelText("Description"),
        "She had some tasty nachos and margarita!",
      );
      userEvent.type(screen.getByLabelText("Start Date"), "02152022");
      userEvent.type(screen.getByLabelText("Start Time"), "08:10");
      userEvent.type(screen.getByLabelText("End Date"), "02152022");
      userEvent.type(screen.getByLabelText("End Time"), "10:10");
      await act(async () => {
        await waitFor(() => {
          userEvent.click(screen.getByRole("button", { name: "Create Event" }));
        });
      });
      expect(await screen.findByLabelText("Title")).toHaveAttribute(
        "value",
        "Berta goes to the baseball game!",
      );
      expect(
        await screen.findByText("Berta goes to the baseball game!"),
      ).toBeVisible();
      expect(mockCreateEntry).toHaveBeenCalledWith({
        startTimeUtc: new Date("2022-02-15T16:10:00.000Z"),
        endTimeUtc: new Date("2022-02-15T18:10:00.000Z"),
        title: "Berta goes to the baseball game!",
        description: "She had some tasty nachos and margarita!",
        allDay: false,
        recurring: false,
      });
    });

    it("fetches event details when event is clicked", async () => {
      mockGetEntries.mockResolvedValue([
        {
          _id: "123",
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
          allDay: false,
        },
        {
          _id: "345",
          end: "2022-02-24T05:43:37.868Z",
          start: "2022-02-24T05:43:37.868Z",
          title: "Dance",
          allDay: false,
        },
      ]);

      mockGetEntry.mockResolvedValue([
        {
          _id: "345",
          end: "2022-02-24T05:43:37.868Z",
          start: "2022-02-24T05:43:37.868Z",
          title: "Dance",
          allDay: false,
        },
      ]);

      render(
        <Calendar
          createEntry={mockCreateEntry}
          getEntries={mockGetEntries}
          getEntry={mockGetEntry}
          updateEntry={mockUpdateEntry}
          deleteEntry={mockDeleteEntry}
        />,
      );
      expect(mockGetEntries).toHaveBeenCalledTimes(2);
      const eventText = await screen.findByText("Dance");
      expect(eventText).toBeInTheDocument();
      eventText.click();
      expect(mockGetEntry).toHaveBeenCalledWith(
        "345",
        "2022-02-24T05:43:37.868Z",
      );
      const modal = await screen.findByRole("dialog");
      expect(modal).toBeVisible();
      expect(await within(modal).findByText("Edit")).toBeVisible();
      expect(await within(modal).findByText("Delete")).toBeVisible();
    });

    it("deletes entry when delete button is clicked", async () => {
      mockGetEntries.mockResolvedValue([
        {
          _id: "123",
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
        },
        {
          _id: "345",
          end: "2022-02-24T05:43:37.868Z",
          start: "2022-02-24T05:43:37.868Z",
          title: "Dance",
        },
      ]);

      mockGetEntry.mockResolvedValue({
        _id: "345",
        end: "2022-02-24T05:43:37.868Z",
        start: "2022-02-24T05:43:37.868Z",
        title: "Dance",
        description: "fun times",
      });

      mockDeleteEntry.mockResolvedValue(new Response());

      mockGetEntries.mockResolvedValueOnce([
        {
          _id: "123",
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
        },
      ]);

      await act(async () => {
        await render(
          <Calendar
            createEntry={mockCreateEntry}
            getEntries={mockGetEntries}
            getEntry={mockGetEntry}
            updateEntry={mockUpdateEntry}
            deleteEntry={mockDeleteEntry}
          />,
        );
      });
      expect(mockGetEntries).toHaveBeenCalledTimes(2);
      const eventText = await screen.findByText("Dance");
      expect(eventText).toBeInTheDocument();
      await act(async () => {
        await eventText.click();
      });
      expect(mockGetEntry).toHaveBeenCalledTimes(1);
      const deleteButton = await screen.findByText("Delete");
      await act(async () => {
        await deleteButton.click();
        expect(mockDeleteEntry).toHaveBeenCalled();
      });
    });

    it("allows for deletion of a single recurring instance", async () => {
      mockGetEntries.mockResolvedValue([
        {
          _id: "123",
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
          recurring: true,
        },
        {
          _id: "345",
          end: "2022-02-24T05:43:37.868Z",
          start: "2022-02-24T05:43:37.868Z",
          title: "Dance",
          recurring: true,
        },
      ]);

      mockGetEntry.mockResolvedValue({
        _id: "345",
        end: "2022-02-24T05:43:37.868Z",
        startTimeUtc: "2022-02-24T05:43:37.868Z",
        title: "Dance",
        description: "fun times",
        recurring: true,
      });

      mockDeleteEntry.mockResolvedValue(new Response());

      await act(async () => {
        await render(
          <Calendar
            createEntry={mockCreateEntry}
            getEntries={mockGetEntries}
            getEntry={mockGetEntry}
            updateEntry={mockUpdateEntry}
            deleteEntry={mockDeleteEntry}
          />,
        );
      });
      const eventText = await screen.findByText("Dance");
      expect(eventText).toBeInTheDocument();
      await act(async () => {
        await eventText.click();
      });
      expect(mockGetEntry).toHaveBeenCalledTimes(1);
      const deleteButton = await screen.findByText("Delete");
      await act(async () => {
        await deleteButton.click();
      });
      expect(
        await screen.findByText(
          "Would you like to delete the entire recurring series or just this event?",
        ),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(screen.getByText("Delete this one event"));
      });
      expect(mockDeleteEntry).toHaveBeenCalledWith(
        "345",
        "2022-02-24T05:43:37.868Z",
        false,
      );
    });

    it("allows for editing a single instance of recurring event", async () => {
      mockGetEntries.mockResolvedValue([
        {
          _id: "123",
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
          recurring: true,
        },
        {
          _id: "345",
          end: "2022-02-24T05:43:37.868Z",
          start: "2022-02-24T05:43:37.868Z",
          title: "Dance",
          recurring: true,
        },
      ]);

      mockGetEntry.mockResolvedValue({
        _id: "345",
        end: "2022-02-24T05:43:37.868Z",
        startTimeUtc: "2022-02-24T05:43:37.868Z",
        endTimeUtc: "2022-02-25T05:43:37.868Z",
        title: "Dance",
        description: "fun times",
        recurring: true,
        recurrenceEndUtc: "2023-02-24T05:43:37.868Z",
      });

      mockUpdateEntry.mockResolvedValue(new Response());
      await act(async () => {
        await render(
          <Calendar
            createEntry={mockCreateEntry}
            getEntries={mockGetEntries}
            getEntry={mockGetEntry}
            updateEntry={mockUpdateEntry}
            deleteEntry={mockDeleteEntry}
          />,
        );
      });
      const eventText = await screen.findByText("Dance");
      expect(eventText).toBeInTheDocument();
      await act(async () => {
        await eventText.click();
      });
      expect(mockGetEntry).toHaveBeenCalledTimes(1);

      const editButton = await screen.findByText("Edit");
      expect(editButton).toBeInTheDocument();
      await act(async () => {
        await editButton.click();
      });

      userEvent.type(
        screen.getByLabelText("Description"),
        " at the grand royale",
      );

      const saveButton = await screen.findByText("Save");
      expect(saveButton).toBeInTheDocument();
      await act(async () => {
        await saveButton.click();
      });

      expect(
        await screen.findByText(
          "Would you like to edit the entire recurring series or just this event?",
        ),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(screen.getByText("Edit this one event"));
      });
      expect(mockUpdateEntry).toHaveBeenCalledWith(
        "345",
        expect.objectContaining({
          title: "Dance",
          description: "fun times at the grand royale",
        }),
        "2022-02-24T05:43:37.868Z",
        false,
      );
    });

    it("automatically sets end date when start date is selected", async () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([]);
      await act(async () => {
        await render(
          <Calendar
            createEntry={mockCreateEntry}
            getEntries={mockGetEntries}
            getEntry={mockGetEntry}
            updateEntry={mockUpdateEntry}
            deleteEntry={mockDeleteEntry}
          />,
        );
      });
      userEvent.click(screen.getByLabelText("add event"));
      userEvent.type(screen.getByLabelText("Start Date"), "2016-12-12");
      expect(screen.getByLabelText("Start Date")).toHaveValue("2016-12-12");
      expect(screen.getByLabelText("End Date")).toHaveValue("2016-12-12");
    });

    // TODO: Fix failure due to timeout
    it.skip("passes recurrence frequency when recurring event is created", async () => {
      mockGetEntries.mockResolvedValue([]);
      mockCreateEntry.mockResolvedValue({});
      await act(async () => {
        await render(
          <Calendar
            createEntry={mockCreateEntry}
            getEntries={mockGetEntries}
            getEntry={mockGetEntry}
            updateEntry={mockUpdateEntry}
            deleteEntry={mockDeleteEntry}
          />,
        );
      });

      userEvent.click(screen.getByLabelText("add event"));
      userEvent.click(screen.getByLabelText("Title"));
      userEvent.type(
        screen.getByLabelText("Title"),
        "Berta goes to the baseball game!",
      );
      userEvent.type(
        screen.getByLabelText("Description"),
        "She had some tasty nachos and margaritas!",
      );
      userEvent.type(screen.getByLabelText("Start Date"), "02152022");
      userEvent.type(screen.getByLabelText("Start Time"), "08:10");
      userEvent.type(screen.getByLabelText("End Date"), "02152022");
      userEvent.type(screen.getByLabelText("End Time"), "10:10");
      userEvent.click(screen.getByText("Recurring"));
      userEvent.click(screen.getByText("Weekly"));

      await act(() => {
        userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      });

      expect(mockCreateEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          allDay: false,
          description: "She had some tasty nachos and margaritas!",
          frequency: "weekly",
          recurring: true,
          title: "Berta goes to the baseball game!",
        }),
      );
    });
  });

  describe("user errors", () => {
    it("errors when end date is before start date", async () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([]);
      await act(async () => {
        await render(
          <Calendar
            createEntry={mockCreateEntry}
            getEntries={mockGetEntries}
            getEntry={mockGetEntry}
            updateEntry={mockUpdateEntry}
            deleteEntry={mockDeleteEntry}
          />,
        );
      });
      userEvent.click(screen.getByLabelText("add event"));
      userEvent.type(screen.getByLabelText("Title"), "Happy dance!");
      userEvent.type(screen.getByLabelText("Start Date"), "2016-12-12");
      expect(screen.getByLabelText("Start Date")).toHaveValue("2016-12-12");
      userEvent.type(screen.getByLabelText("End Date"), "2016-11-11");
      expect(screen.getByLabelText("End Date")).toHaveValue("2016-11-11");
      waitFor(() => {
        userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      });
      expect(
        screen.getByText("Error: end cannot be before start."),
      ).toBeInTheDocument();
    });

    it("errors when end time is before start time on the same day", async () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([]);
      await act(async () => {
        await render(
          <Calendar
            createEntry={mockCreateEntry}
            getEntries={mockGetEntries}
            getEntry={mockGetEntry}
            updateEntry={mockUpdateEntry}
            deleteEntry={mockDeleteEntry}
          />,
        );
      });
      userEvent.click(screen.getByLabelText("add event"));
      userEvent.type(screen.getByLabelText("Title"), "Happy dance!");
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
        screen.getByText("Error: end cannot be before start."),
      ).toBeInTheDocument();
    });
  });

  describe("backend interaction errors", () => {
    it("getEntries error displays error message", async () => {
      mockGetEntries.mockRejectedValue("Error in getEntry");
      render(
        <Calendar
          createEntry={mockCreateEntry}
          getEntries={mockGetEntries}
          getEntry={mockGetEntry}
          updateEntry={mockUpdateEntry}
          deleteEntry={mockDeleteEntry}
        />,
      );

      expect(await screen.findByRole("alert")).toBeVisible();
    });

    it("createEntry error displays error message", async () => {
      mockGetEntries.mockResolvedValue([]);
      mockCreateEntry.mockRejectedValue("Error in createEntry");
      render(
        <Calendar
          createEntry={mockCreateEntry}
          getEntries={mockGetEntries}
          getEntry={mockGetEntry}
          updateEntry={mockUpdateEntry}
          deleteEntry={mockDeleteEntry}
        />,
      );

      userEvent.click(screen.getByLabelText("add event"));
      userEvent.click(screen.getByLabelText("Title"));
      userEvent.type(
        screen.getByLabelText("Title"),
        "Berta goes to the baseball game!",
      );
      userEvent.type(
        screen.getByLabelText("Description"),
        "She had some tasty nachos and margaritas!",
      );
      userEvent.type(screen.getByLabelText("Start Date"), "02152022");
      userEvent.type(screen.getByLabelText("Start Time"), "08:10");
      userEvent.type(screen.getByLabelText("End Date"), "02152022");
      userEvent.type(screen.getByLabelText("End Time"), "10:10");
      await act(async () => {
        userEvent.click(screen.getByRole("button", { name: "Create Event" }));
      });

      expect(await screen.findByRole("alert")).toBeVisible();
    });

    it("getEntry error displays error message", async () => {
      mockGetEntries.mockResolvedValue([
        {
          _id: "123",
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Dance",
        },
      ]);

      mockGetEntry.mockRejectedValue("Error in getEntry");
      render(
        <Calendar
          createEntry={mockCreateEntry}
          getEntries={mockGetEntries}
          getEntry={mockGetEntry}
          updateEntry={mockUpdateEntry}
          deleteEntry={mockDeleteEntry}
        />,
      );

      const eventText = await screen.findByText("Dance");
      expect(eventText).toBeInTheDocument();
      await act(async () => {
        await eventText.click();
      });
      expect(await screen.findByRole("alert")).toBeVisible();
    });

    it("updateEntry displays an error message", async () => {
      mockGetEntries.mockResolvedValue([
        {
          _id: "123",
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Dance",
        },
      ]);

      mockGetEntry.mockResolvedValue({
        _id: "123",
        end: "2022-02-27T05:43:37.868Z",
        start: "2022-02-27T05:43:37.868Z",
        title: "Dance",
      });

      mockUpdateEntry.mockRejectedValue("Error in updateEntry");

      render(
        <Calendar
          createEntry={mockCreateEntry}
          getEntries={mockGetEntries}
          getEntry={mockGetEntry}
          updateEntry={mockUpdateEntry}
          deleteEntry={mockDeleteEntry}
        />,
      );

      const eventText = await screen.findByText("Dance");
      expect(eventText).toBeInTheDocument();
      await act(async () => {
        await eventText.click();
      });

      // This block throws the error
      userEvent.click(screen.getByText("Edit"));
      userEvent.type(
        screen.getByLabelText("Description"),
        "party in the evening",
      );

      userEvent.click(screen.getByText("Save"));
      expect(await screen.findByRole("alert")).toBeVisible();
    });

    it("deleteEntry displays an error message", async () => {
      mockGetEntries.mockResolvedValue([
        {
          _id: "123",
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
        },
        {
          _id: "345",
          end: "2022-02-24T05:43:37.868Z",
          start: "2022-02-24T05:43:37.868Z",
          title: "Dance",
        },
      ]);

      mockGetEntry.mockResolvedValue({
        _id: "345",
        end: "2022-02-24T05:43:37.868Z",
        start: "2022-02-24T05:43:37.868Z",
        title: "Dance",
        description: "fun times",
      });

      mockGetEntries.mockResolvedValueOnce([
        {
          _id: "123",
          end: "2022-02-27T05:43:37.868Z",
          start: "2022-02-27T05:43:37.868Z",
          title: "Berta goes to the baseball game!",
        },
      ]);

      mockDeleteEntry.mockRejectedValue("Error in deleteEntry");

      render(
        <Calendar
          createEntry={mockCreateEntry}
          getEntries={mockGetEntries}
          getEntry={mockGetEntry}
          updateEntry={mockUpdateEntry}
          deleteEntry={mockDeleteEntry}
        />,
      );

      expect(mockGetEntries).toHaveBeenCalledTimes(2);
      const eventText = await screen.findByText("Dance");
      expect(eventText).toBeInTheDocument();
      await act(async () => {
        await eventText.click();
      });
      expect(mockGetEntry).toHaveBeenCalledTimes(1);
      const deleteButton = await screen.findByText("Delete");
      await act(async () => {
        await deleteButton.click();
      });
      expect(await screen.findByRole("alert")).toBeVisible();
    });
  });
});

describe("App - edge cases for late night times", () => {
  describe("10:40PM", () => {
    beforeAll(() => {
      jest.useFakeTimers("modern");
      const date = new Date("2022-02-15T10:40");
      jest.setSystemTime(date);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("defaults to today's date and a one hour time window starting at the next hour", () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([]);
      waitFor(() => {
        render(<App />);
      });
      userEvent.click(screen.getByLabelText("add event"));
      expect(screen.getByLabelText("Start Date")).toHaveValue("2022-02-15");
      expect(screen.getByLabelText("End Date")).toHaveValue("2022-02-16");
      expect(screen.getByLabelText("Start Time")).toHaveValue("11:00");
      expect(screen.getByLabelText("End Time")).toHaveValue("12:00");
    });
  });
  describe("11:40PM", () => {
    beforeAll(() => {
      jest.useFakeTimers("modern");
      const date = new Date("2022-02-15T11:40");
      jest.setSystemTime(date);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("defaults to today's date and a one hour time window starting at the next hour", () => {
      mockCreateEntry.mockResolvedValue({});
      mockGetEntries.mockResolvedValue([]);
      waitFor(() => {
        render(<App />);
      });
      userEvent.click(screen.getByLabelText("add event"));
      expect(screen.getByLabelText("Start Date")).toHaveValue("2022-02-16");
      expect(screen.getByLabelText("End Date")).toHaveValue("2022-02-16");
      expect(screen.getByLabelText("Start Time")).toHaveValue("12:00");
      expect(screen.getByLabelText("End Time")).toHaveValue("01:00");
    });
  });
});
