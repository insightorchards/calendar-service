import React, { useState } from "react";
import { formatDate, getDateTimeString } from "./lib";
import { Checkbox } from "@chakra-ui/react";
import s from "./EventForm.module.css";

interface FormProps {
  initialStartDate: string;
  initialEndDate: string;
  initialStartTime: string;
  initialEndTime: string;
  initialTitle: string;
  initialDescription: string;
  initialAllDay: boolean;
  onSave: Function;
  isCreate: boolean;
}

const EventForm = ({
  initialStartDate,
  initialEndDate,
  initialStartTime,
  initialEndTime,
  initialTitle,
  initialDescription,
  initialAllDay,
  onSave,
  isCreate,
}: FormProps) => {
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);
  const [startTime, setStartTime] = useState<string>(initialStartTime);
  const [endTime, setEndTime] = useState<string>(initialEndTime);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>(initialTitle);
  const [description, setDescription] = useState<string>(initialDescription);
  const [allDay, setAllDay] = useState<boolean>(initialAllDay);

  const handleSave = async (_: React.MouseEvent<HTMLButtonElement>) => {
    const startDateAndTime: string = getDateTimeString(startDate, startTime);
    const endDateAndTime: string = getDateTimeString(endDate, endTime);
    if (startDateAndTime > endDateAndTime) {
      setError("Error: end cannot be before start.");
      return;
    }
    onSave({
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      allDay,
    });

    if (isCreate) {
      setTitle(initialTitle);
      setDescription(initialDescription);
      setError(null);
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      setStartTime(initialStartTime);
      setEndTime(initialEndTime);
      setAllDay(initialAllDay);
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
      <div className={s.inputRow}>
        <label htmlFor="startDate" className={s.formItem}>
          Start Date
          <input
            className={s.formInput}
            id="startDate"
            min={formatDate(new Date())}
            type="date"
            onChange={(e) => {
              setStartDate(e.target.value);
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
      </div>
      <div className={s.inputRow}>
        <Checkbox
          isChecked={allDay}
          onChange={(e) => {
            setAllDay(e.target.checked);
          }}
        >
          All Day
        </Checkbox>
      </div>
      <div className={s.inputRow}>
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
      </div>
      <button className={s.formSubmit} onClick={handleSave}>
        {isCreate ? "Create Event" : "Save"}
      </button>
      {error && <p className={s.error}>{error}</p>}
    </div>
  );
};

export default EventForm;
