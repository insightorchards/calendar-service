import React, { useState } from "react";
import { formatDate, applyTimeToDate, padNumberWith0Zero } from "./lib";
import { Checkbox, RadioGroup, Radio, Stack } from "@chakra-ui/react";
import s from "./EventForm.module.css";

interface FormProps {
  initialStart: string; //"2022-02-15T04:00"
  initialEnd: string; //"2022-02-15T04:00"
  initialTitle: string;
  initialDescription: string;
  initialAllDay: boolean;
  initialRecurring: boolean;
  initialRecurrenceEnd: string;
  onFormSubmit: Function;
  isCreate: boolean;
}

const EventForm = ({
  initialStart,
  initialEnd,
  initialTitle = "",
  initialDescription = "",
  initialAllDay,
  initialRecurring,
  initialRecurrenceEnd,
  onFormSubmit,
  isCreate,
}: FormProps) => {
  const getYearMonthDay = (date: Date) => {
    const month =
      (date.getMonth() + 1).toString().length < 2
        ? `0${date.getMonth() + 1}`
        : date.getMonth() + 1;
    const day =
      date.getDate().toString().length < 2
        ? `0${date.getDate()}`
        : date.getDate();
    return `${date.getFullYear()}-${month}-${day}`;
  };
  const [startDate, setStartDate] = useState<string>(
    getYearMonthDay(new Date(initialStart)),
  );
  const [endDate, setEndDate] = useState<string>(
    getYearMonthDay(new Date(initialEnd)),
  );
  const [startTime, setStartTime] = useState<string>(
    new Date(initialStart).toLocaleTimeString("it-IT"),
  );
  const [endTime, setEndTime] = useState<string>(
    new Date(initialEnd).toLocaleTimeString("it-IT"),
  );

  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>(initialTitle);
  const [description, setDescription] = useState<string>(initialDescription);
  const [allDay, setAllDay] = useState<boolean>(initialAllDay);
  const [recurring, setRecurring] = useState<boolean>(initialRecurring);
  const [recurrenceFrequency, setRecurrenceFrequency] =
    useState<string>("monthly");

  const currentHour: number = new Date().getHours();

  const DEFAULT_START_TIME: string = `${padNumberWith0Zero(
    currentHour + 1,
  )}:00`;
  const DEFAULT_END_TIME: string = `${padNumberWith0Zero(currentHour + 2)}:00`;

  const recurrenceBeginDate = new Date(applyTimeToDate(startDate, startTime));

  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>(
    getYearMonthDay(new Date(initialRecurrenceEnd)),
  );

  const handleFormSubmit = async (_: React.MouseEvent<HTMLButtonElement>) => {
    const startDateAndTime: string = applyTimeToDate(startDate, startTime);
    const endDateAndTime: string = applyTimeToDate(endDate, endTime);
    const recurrenceEndDateAndTime: string = applyTimeToDate(
      recurrenceEndDate,
      startTime,
    );

    if (title === "") {
      setError("Error: Add Title");
      return;
    }
    if (startDateAndTime > endDateAndTime) {
      setError("Error: end cannot be before start.");
      return;
    }
    if (endDateAndTime > recurrenceEndDateAndTime) {
      setError("Error: recurrence end cannot be before start.");
      return;
    }
    if (!recurring) {
      onFormSubmit({
        title,
        description,
        startDate,
        endDate,
        startTime,
        endTime,
        allDay,
        recurring,
      });
    } else {
      onFormSubmit({
        title,
        description,
        startDate,
        endDate,
        startTime,
        endTime,
        allDay,
        recurring,
        frequency: recurrenceFrequency,
        recurrenceBegins: recurrenceBeginDate,
        recurrenceEnds: recurrenceEndDate,
      });
    }
  };

  return (
    <div className={s.container}>
      <label htmlFor="title" className={s.formItem}>
        Title
        <input
          className={s.formInput}
          id="title"
          type="text"
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          value={title}
        />
      </label>
      <label htmlFor="description" className={s.formItem}>
        Description
        <input
          className={s.formInput}
          id="description"
          type="text"
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          value={description}
        />
      </label>
      <label htmlFor="startDate" className={s.formItem}>
        Start Date
        <input
          className={s.formInput}
          id="startDate"
          min={formatDate(new Date())}
          type="date"
          onChange={(e) => {
            console.log("e.target.value", e.target.value);
            setStartDate(e.target.value);
            setEndDate(e.target.value);
          }}
          value={startDate}
        />
      </label>
      <label htmlFor="endDate" className={s.formItem}>
        End Date
        <input
          className={s.formInput}
          id="endDate"
          min={startDate}
          type="date"
          onChange={(e) => {
            setEndDate(e.target.value);
          }}
          value={endDate}
        />
      </label>
      <div className={s.checkbox}>
        <Checkbox
          isChecked={allDay}
          onChange={(e) => {
            setAllDay(e.target.checked);
            if (e.target.checked === false) {
              setStartTime(DEFAULT_START_TIME);
              setEndTime(DEFAULT_END_TIME);
            }
          }}
        >
          All Day
        </Checkbox>
      </div>
      {!allDay && (
        <>
          <label htmlFor="startTime" className={s.formItem}>
            Start Time
            <input
              className={s.formInput}
              id="startTime"
              type="time"
              onChange={(e) => {
                setStartTime(e.target.value);
              }}
              value={startTime}
              disabled={allDay}
            />
          </label>
          <label htmlFor="endTime" className={s.formItem}>
            End Time
            <input
              className={s.formInput}
              id="endTime"
              type="time"
              onChange={(e) => {
                setEndTime(e.target.value);
              }}
              value={endTime}
              disabled={allDay}
            />
          </label>
        </>
      )}
      <div className={s.checkbox}>
        <Checkbox
          isChecked={recurring}
          onChange={(e) => {
            setRecurring(e.target.checked);
          }}
        >
          Recurring
        </Checkbox>
      </div>
      {recurring && (
        <>
          <label htmlFor="recurrenceType" className={s.formItem}>
            Recurrence Frequency
            <RadioGroup
              onChange={setRecurrenceFrequency}
              value={recurrenceFrequency}
            >
              <Stack direction="row">
                <Radio value="monthly">Monthly</Radio>
                <Radio value="weekly">Weekly</Radio>
              </Stack>
            </RadioGroup>
          </label>
          <label htmlFor="recurrenceEnd" className={s.formItem}>
            Recurrence Ends
            <input
              className={s.formInput}
              id="recurrenceEnd"
              min={endDate}
              type="date"
              onChange={(e) => {
                setRecurrenceEndDate(e.target.value);
              }}
              value={recurrenceEndDate}
            />
          </label>
        </>
      )}
      <button className={s.formSubmit} onClick={handleFormSubmit}>
        {isCreate ? "Create Event" : "Save"}
      </button>
      {error && <p className={s.error}>{error}</p>}
    </div>
  );
};

export default EventForm;
