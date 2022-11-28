import React, { useState } from "react";
import { formatDate, getDateTimeString } from "./lib";
import s from "./App.module.css";

interface FormProps {
  initialStartDate: string;
  initialEndDate: string;
  initialStartTime: string;
  initialEndTime: string;
  initialTitle: string;
  initialDescription: string;
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

  const handleSave = async (_: React.MouseEvent<HTMLButtonElement>) => {
    const startDateAndTime: string = getDateTimeString(startDate, startTime);
    const endDateAndTime: string = getDateTimeString(endDate, endTime);
    if (startDateAndTime > endDateAndTime) {
      setError("Error: end cannot be before start.");
      return;
    }
    onSave({ title, description, startDate, endDate, startTime, endTime });

    if (isCreate) {
      setTitle(initialTitle);
      setDescription(initialDescription);
      setError(null);
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      setStartTime(initialStartTime);
      setEndTime(initialEndTime);
    }
  };

  return (
    <div className={s.formInputs}>
      <label htmlFor="title" className={s.formItem}>
        Title
        <input
          className={s.formTitleInput}
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
          className={s.formTitleInput}
          id="description"
          type="text"
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          value={title}
        />
      </label>
      <div className={s.inputGroup}>
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
      <div className={s.inputGroup}>
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
          />
        </label>
      </div>
      <div className={s.saveButton}>
        <button className={s.formSubmit} onClick={handleSave}>
          {isCreate ? "Create Event" : "Save"}
        </button>

        {error && <p className={s.error}>{error}</p>}
      </div>
    </div>
  );
};

export default EventForm;
