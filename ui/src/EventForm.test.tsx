import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

import userEvent from "@testing-library/user-event";
import { formatDate, padNumberWith0Zero } from "./lib";
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
    render(
      <EventForm
        initialStartDate={formatDate(new Date())}
        initialEndDate={formatDate(new Date())}
        initialStartTime={`${padNumberWith0Zero(
          currentHour,
        )}:${padNumberWith0Zero(currentMinute)}`}
        initialEndTime={`${padNumberWith0Zero(
          currentHour + 1,
        )}:${padNumberWith0Zero(currentMinute)}`}
        initialTitle="Mary's Chicken Feast"
        initialDescription="A time to remember and appreciate chicken nuggets and more"
        initialAllDay={false}
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
    expect(screen.getByRole("button")).toHaveAccessibleName("Create Event");
  });

  it("displays `Save` button when `isCreate` is false", () => {
    render(
      <EventForm
        initialStartDate={formatDate(new Date())}
        initialEndDate={formatDate(new Date())}
        initialStartTime={`${padNumberWith0Zero(
          currentHour,
        )}:${padNumberWith0Zero(currentMinute)}`}
        initialEndTime={`${padNumberWith0Zero(
          currentHour + 1,
        )}:${padNumberWith0Zero(currentMinute)}`}
        initialTitle="Arty party"
        initialDescription="A time to remember and appreciate classic art and more"
        initialAllDay={false}
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
        initialStartDate={formatDate(new Date())}
        initialEndDate={formatDate(new Date())}
        initialStartTime={`${padNumberWith0Zero(
          currentHour,
        )}:${padNumberWith0Zero(currentMinute)}`}
        initialEndTime={`${padNumberWith0Zero(
          currentHour + 1,
        )}:${padNumberWith0Zero(currentMinute)}`}
        initialTitle="Arty party"
        initialDescription="A time to remember and appreciate classic art and more"
        initialAllDay={false}
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
    });
  });

  it("hides time sections when all day is selected", () => {
    render(
      <EventForm
        initialStartDate={formatDate(new Date())}
        initialEndDate={formatDate(new Date())}
        initialStartTime={`${padNumberWith0Zero(
          currentHour,
        )}:${padNumberWith0Zero(currentMinute)}`}
        initialEndTime={`${padNumberWith0Zero(
          currentHour + 1,
        )}:${padNumberWith0Zero(currentMinute)}`}
        initialTitle="Arty party"
        initialDescription="A time to remember and appreciate classic art and more"
        initialAllDay={true}
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

  it("resets inputs correctly to default values when submitted", async () => {
    render(
      <EventForm
        initialStartDate={formatDate(new Date())}
        initialEndDate={formatDate(new Date())}
        initialStartTime={`${padNumberWith0Zero(
          currentHour,
        )}:${padNumberWith0Zero(currentMinute)}`}
        initialEndTime={`${padNumberWith0Zero(
          currentHour + 1,
        )}:${padNumberWith0Zero(currentMinute)}`}
        initialTitle="Arty party"
        initialDescription="A time to remember and appreciate classic art and more"
        initialAllDay={false}
        onFormSubmit={() => {}}
        isCreate={true}
      />,
    );
    userEvent.type(screen.getByLabelText("Start Date"), "03162022");
    userEvent.type(screen.getByLabelText("Start Time"), "08:10");
    userEvent.type(screen.getByLabelText("End Date"), "03182022");
    userEvent.type(screen.getByLabelText("End Time"), "10:10");
    userEvent.click(screen.getByLabelText("All Day"));
    await waitFor(() => {
      userEvent.click(screen.getByRole("button", { name: "Create Event" }));
    });
    expect(screen.getByLabelText("Start Date")).toHaveValue("2022-02-15");
    expect(screen.getByLabelText("End Date")).toHaveValue("2022-02-15");
    expect(screen.getByLabelText("Start Time")).toHaveValue("04:00");
    expect(screen.getByLabelText("End Time")).toHaveValue("05:00");
    expect(screen.getByLabelText("All Day")).not.toBeChecked();
  });
});