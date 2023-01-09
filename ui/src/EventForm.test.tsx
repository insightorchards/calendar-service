import { render, screen } from "@testing-library/react";
import React from "react";

import userEvent from "@testing-library/user-event";
import { formatDate, getDateTimeString, padNumberWith0Zero } from "./lib";
import EventForm from "./EventForm";

describe("EventForm", () => {
  let currentHour: number;
  let currentMinute: number;
  beforeAll(() => {
    jest.useFakeTimers("modern" as FakeTimersConfig);
    const date = new Date("2022-02-15T04:00");
    jest.setSystemTime(date);
    currentHour = new Date().getHours();
    currentMinute = new Date().getMinutes();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("displays initial values", () => {
    const datePlusHours: Function = (date: Date, hours: number): Date => {
      date.setHours(date.getHours() + hours);
      return date;
    };
    render(
      <EventForm
        initialStart={formatDate(new Date())}
        initialEnd={formatDate(datePlusHours(new Date(), 1))}
        initialTitle="Mary's Chicken Feast"
        initialDescription="A time to remember and appreciate chicken nuggets and more"
        initialAllDay={false}
        initialRecurring={true}
        initialRecurrenceEnd={formatDate(new Date("2022-06-15T04:00"))}
        onFormSubmit={() => {}}
        isCreate={true}
      />,
    );

    expect(screen.getByLabelText("Start Date")).toHaveValue("2022-02-15");
    expect(screen.getByLabelText("End Date")).toHaveValue("2022-02-15");
    expect(screen.getByLabelText("Start Time")).toHaveValue("04:00");
    expect(screen.getByLabelText("End Time")).toHaveValue("05:00");
    expect(screen.getByLabelText("Title")).toHaveValue("Mary's Chicken Feast");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "A time to remember and appreciate chicken nuggets and more",
    );
    expect(screen.getByLabelText("All Day")).not.toBeChecked();
    expect(screen.getByLabelText("Recurring")).toBeChecked();
    expect(screen.getByLabelText("Recurrence Ends")).toHaveValue("2022-06-15");
    expect(screen.getByRole("button")).toHaveAccessibleName("Create Event");
  });

  it("displays `Save` button when `isCreate` is false", () => {
    render(
      <EventForm
        initialStart={formatDate(new Date("2022-02-15T04:00"))}
        initialEnd={formatDate(new Date("2022-02-15T05:00"))}
        initialTitle="Arty party"
        initialDescription="A time to remember and appreciate classic art and more"
        initialAllDay={false}
        initialRecurring={false}
        initialRecurrenceEnd={formatDate(new Date("2022-06-15T04:00"))}
        onFormSubmit={() => {}}
        isCreate={false}
      />,
    );

    expect(screen.getByRole("button")).toHaveAccessibleName("Save");
  });

  it("calls onFormSubmit when form is submitted", () => {
    const onFormSubmitMock = jest.fn();
    render(
      <EventForm
        initialStart={formatDate(new Date("2022-02-15T04:00"))}
        initialEnd={formatDate(new Date("2022-02-15T05:00"))}
        initialTitle="Arty party"
        initialDescription="A time to remember and appreciate classic art and more"
        initialAllDay={false}
        initialRecurring={false}
        initialRecurrenceEnd={formatDate(new Date("2022-06-15T04:00"))}
        onFormSubmit={onFormSubmitMock}
        isCreate={false}
      />,
    );

    userEvent.click(screen.getByRole("button"));
    expect(onFormSubmitMock).toHaveBeenCalledWith({
      description: "A time to remember and appreciate classic art and more",
      endDate: "2022-02-15",
      endTime: "05:00",
      startDate: "2022-02-15",
      startTime: "04:00",
      title: "Arty party",
      allDay: false,
      recurring: false,
    });
  });

  it("displays error when form is submitted with no title", () => {
    const onFormSubmitMock = jest.fn();
    render(
      <EventForm
        initialStart={formatDate(new Date("2022-02-15T04:00"))}
        initialEnd={formatDate(new Date("2022-02-15T05:00"))}
        initialTitle=""
        initialDescription="A time to remember and appreciate classic art and more"
        initialAllDay={false}
        initialRecurring={false}
        initialRecurrenceEnd={formatDate(new Date("2022-06-15T04:00"))}
        onFormSubmit={onFormSubmitMock}
        isCreate={false}
      />,
    );
    userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Error: Add Title")).toBeVisible();
  });

  it("hides time sections when all day is selected", () => {
    render(
      <EventForm
        initialStart={formatDate(new Date("2022-02-15T04:00"))}
        initialEnd={formatDate(new Date("2022-02-15T05:00"))}
        initialTitle="Arty party"
        initialDescription="A time to remember and appreciate classic art and more"
        initialAllDay={true}
        initialRecurring={false}
        initialRecurrenceEnd={formatDate(new Date("2022-06-15T04:00"))}
        onFormSubmit={() => {}}
        isCreate={false}
      />,
    );
    expect(screen.getByLabelText("All Day")).toBeChecked();
    expect(screen.queryByLabelText("Start Time")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("End Time")).not.toBeInTheDocument();

    userEvent.click(screen.getByLabelText("All Day"));
    expect(screen.getByLabelText("All Day")).not.toBeChecked();
    expect(screen.getByLabelText("Start Time")).toBeInTheDocument();
    expect(screen.getByLabelText("End Time")).toBeInTheDocument();
  });

  describe("recurring events", () => {
    it("calls onFormSubmit with recurrence data when recurring event is submitted", () => {
      const onFormSubmitMock = jest.fn();
      render(
        <EventForm
          initialStart={formatDate(new Date("2022-02-15T04:00"))}
          initialEnd={formatDate(new Date("2022-02-15T05:00"))}
          initialTitle="Arty party"
          initialDescription="A time to remember and appreciate classic art and more"
          initialAllDay={false}
          initialRecurring={true}
          initialRecurrenceEnd={formatDate(new Date("2023-02-15T04:00"))}
          onFormSubmit={onFormSubmitMock}
          isCreate={false}
        />,
      );

      userEvent.click(screen.getByRole("button"));
      expect(onFormSubmitMock).toHaveBeenCalledWith({
        description: "A time to remember and appreciate classic art and more",
        endDate: "2022-02-15",
        endTime: "05:00",
        startDate: "2022-02-15",
        startTime: "04:00",
        title: "Arty party",
        allDay: false,
        recurring: true,
        frequency: "monthly",
        recurrenceBegins: new Date(getDateTimeString("2022-02-15", "04:00")),
        recurrenceEnds: "2023-02-15",
      });
    });

    it("displays recurring defaults when recurring is selected", () => {
      const startDate = formatDate(new Date());
      const startTime = `${padNumberWith0Zero(
        currentHour,
      )}:${padNumberWith0Zero(currentMinute)}`;
      render(
        <EventForm
          initialStart={formatDate(new Date("2022-02-15T04:00"))}
          initialEnd={formatDate(new Date("2022-02-15T05:00"))}
          initialTitle="Mary's Chicken Feast"
          initialDescription="A time to remember and appreciate chicken nuggets and more"
          initialAllDay={false}
          initialRecurring={true}
          initialRecurrenceEnd={formatDate(new Date("2023-02-15T04:00"))}
          onFormSubmit={() => {}}
          isCreate={true}
        />,
      );

      expect(screen.getByText("Recurrence Frequency")).toBeVisible();
      expect(screen.getByLabelText("Recurrence Ends")).toHaveValue(
        "2023-02-15",
      );
    });

    it("allows user to choose between monthly and weekly recurrence", () => {
      const startDate = formatDate(new Date());
      const startTime = `${padNumberWith0Zero(
        currentHour,
      )}:${padNumberWith0Zero(currentMinute)}`;
      render(
        <EventForm
          initialStart={formatDate(new Date("2022-02-15T04:00"))}
          initialEnd={formatDate(new Date("2022-02-15T05:00"))}
          initialTitle="Mary's Chicken Feast"
          initialDescription="A time to remember and appreciate chicken nuggets and more"
          initialAllDay={false}
          initialRecurring={true}
          initialRecurrenceEnd={formatDate(new Date("2023-02-15T04:00"))}
          onFormSubmit={() => {}}
          isCreate={true}
        />,
      );

      expect(screen.getByText("Monthly")).toBeVisible();
      expect(screen.getByText("Weekly")).toBeVisible();
    });
  });
});
