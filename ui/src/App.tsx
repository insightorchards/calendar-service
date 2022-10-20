import React, { MouseEvent } from "react";
import moment from "moment";
import { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarEvent } from "./configs/CalendarEvent";
import s from "./App.module.css";

const App = () => {
  console.log("before all", Date.now());
  const currentHour: number = new Date().getHours();
  const currentMinute: number = new Date().getMinutes();
  const padNumberWith0: Function = (num: Number): string =>
    num.toString().padStart(2, "0");
  const defaultStartTime: string = `${padNumberWith0(
    currentHour,
  )}:${padNumberWith0(currentMinute)}`;
  const defaultEndTime: string = `${padNumberWith0(
    currentHour + 1,
  )}:${padNumberWith0(currentMinute)}`;

  const localizer = momentLocalizer(moment);

  const formatDate: Function = (date: Date): string => {
    console.log("date", date);
    return [
      date.getFullYear(),
      padNumberWith0(date.getMonth() + 1),
      padNumberWith0(date.getDate()),
    ].join("-");
  };

  const [startDate, setStartDate] = useState<string>(formatDate(new Date()));
  const [endDate, setEndDate] = useState<string>(formatDate(new Date()));
  const [startTime, setStartTime] = useState<string>(defaultStartTime);
  const [endTime, setEndTime] = useState<string>(defaultEndTime);
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  console.log({ startDate });

  const handleSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const startDateAndTime: Date = new Date(`${startDate}T${startTime}`);
    const endDateAndTime: Date = new Date(`${endDate}T${endTime}`);

    if (startDateAndTime > endDateAndTime) {
      setError("Error: end cannot be before start.");
      return;
    }

    setEvents([
      {
        title: title,
        start: startDateAndTime,
        end: endDateAndTime,
      },
    ]);
    setTitle("");
    setError(null);
  };

  return (
    <div className="App">
      <div>
        {/* <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        /> */}
      </div>
      <label htmlFor="title">Title</label>
      <input
        id="title"
        type="text"
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        value={title}
      />

      <label htmlFor="startDate">Start Date</label>
      <input
        id="startDate"
        min={formatDate(new Date())}
        type="date"
        onChange={(e) => {
          setStartDate(e.target.value);
        }}
        value={startDate}
      />
      <label htmlFor="startTime">Start Time</label>
      <input
        id="startTime"
        type="time"
        onChange={(e) => {
          setStartTime(e.target.value);
        }}
        value={startTime}
      />
      <label htmlFor="endDate">End Date</label>
      <input
        id="endDate"
        min={startDate}
        type="date"
        onChange={(e) => {
          setEndDate(e.target.value);
        }}
        value={endDate}
      />
      <label htmlFor="endTime">End Time</label>
      <input
        id="endTime"
        type="time"
        onChange={(e) => {
          setEndTime(e.target.value);
        }}
        value={endTime}
      />
      <button onClick={handleSubmit}>Create Event</button>
      {error && <p className={s.error}>{error}</p>}
    </div>
  );
};

export default App;
