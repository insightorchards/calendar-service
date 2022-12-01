import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import userEvent from "@testing-library/user-event";
import { createEntry, deleteEntry, getEntries, getEntry } from "./hooks";
import { formatDate, padNumberWith0Zero } from "./lib";
import EventForm from "./EventForm";

describe("EventForm", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern" as FakeTimersConfig);
    const date = new Date("2022-02-15T04:00");
    jest.setSystemTime(date);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("displays initial values", () => {
    const currentHour: number = new Date().getHours();
    const currentMinute: number = new Date().getMinutes();

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
        onSave={() => {}}
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
    const currentHour: number = new Date().getHours();
    const currentMinute: number = new Date().getMinutes();

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
        onSave={() => {}}
        isCreate={false}
      />,
    );

    expect(screen.getByRole("button")).toHaveAccessibleName("Save");
  });

  it("mutes out time sections when all day is selected", () => {
    const currentHour: number = new Date().getHours();
    const currentMinute: number = new Date().getMinutes();

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
        onSave={() => {}}
        isCreate={false}
      />,
    );
    expect(screen.getByLabelText("All Day")).toBeChecked();
    expect(screen.getByLabelText("Start Time")).toHaveValue("04:00");
    expect(screen.getByLabelText("End Time")).toHaveValue("05:00");
  });
});
