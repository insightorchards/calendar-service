import React, { useState } from "react";
import { formatDate, padNumberWith0Zero } from "./lib";
import { Button } from "@chakra-ui/react";
import s from "./App.module.css";

interface FormProps {
  initialStartDate: string;
  initialEndDate: string;
  initialStartTime: string;
  initialEndTime: string;
  initialTitle: string;
  onSave: Function;
}

const EventForm = ({
  initialStartDate,
  initialEndDate,
  initialStartTime,
  initialEndTime,
  initialTitle,
  onSave,
}: FormProps) => {
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);
  const [startTime, setStartTime] = useState<string>(initialStartTime);
  const [endTime, setEndTime] = useState<string>(initialEndTime);
  const [title, setTitle] = useState<string>(initialTitle);

  const handleSave = async (_: React.MouseEvent<HTMLButtonElement>) => {
    onSave({ title, startDate, endDate, startTime, endTime });
  };

  return (
    <div className={s.formInputs}>
      <label htmlFor="title" className={s.formItem}>
        Title
        <input
          className={s.formTitleInput}
          id="title" // change this name to titleInput instead of title
          type="text"
          onChange={(e) => {
            setTitle(e.target.value);
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
      <Button onClick={handleSave} variant="ghost">
        Save
      </Button>
    </div>
  );
};

export default EventForm;