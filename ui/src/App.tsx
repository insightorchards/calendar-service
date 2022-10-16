import React, { MouseEvent } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import s from "./App.module.css";
import { CalendarEvent } from "./configs/CalendarEvent";

const hours = new Date().getHours();
const minutes = new Date().getMinutes();
const padNumberWith0 = (num) => num.toString().padStart(2, "0");
const defaultStartTime = `${padNumberWith0(hours)}:${padNumberWith0(minutes)}`;

// Date.prototype.addHours = function (h) {
//   this.setTime(this.getTime() + h * 60 * 60 * 1000);
//   return this;
// }; // looks like we may not be using the .addHours() function anywhere currently in this file. Not sure if it is outdated or needs to be added.

const defaultEndTime = `${padNumberWith0(hours + 1)}:${padNumberWith0(
  minutes
)}`;

const localizer = momentLocalizer(moment);

function padTo2Digits(num: Number) {
  return num.toString().padStart(2, "0");
}

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join("-");
}

const formatAMPM = (timeString: String) => {
  const date = timeString.substring(0, 5);
  let hours = parseInt(date.substring(0, 2));
  let minutes = date.substring(3, 5);
  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  let strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
};

function App() {
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [endDate, setEndDate] = useState(formatDate(new Date()));
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<String | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]); // put type here in itialized

  const handleSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const startDateAndTime = new Date(`${startDate}T${startTime}`);
    const endDateAndTime = new Date(`${endDate}T${endTime}`);

    if (startDateAndTime > endDateAndTime) {
      setError("Error: end cannot be before start.");
      return;
    }

    setEvents([
      {
        title: `${formatAMPM(startTime)} ${title}`,
        start: startDateAndTime,
        end: endDateAndTime,
      },
    ]);

    setError(null);
  };

  return (
    <div className="App">
      <div>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        />
      </div>
      <label>Title</label>
      <input
        type="text"
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        value={title}
      />

      <label>Start Date</label>
      <input
        min={formatDate(new Date())}
        type="date"
        onChange={(e) => {
          setStartDate(e.target.value);
        }}
        value={startDate}
      />
      <label>Start Time</label>
      <input
        type="time"
        onChange={(e) => {
          setStartTime(e.target.value);
        }}
        value={startTime}
      />
      <label>End Date</label>
      <input
        min={startDate}
        type="date"
        onChange={(e) => {
          setEndDate(e.target.value);
        }}
        value={endDate}
      />
      <label>End Time</label>
      <input
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
}

export default App;
