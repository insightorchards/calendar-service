import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import s from "./App.module.css";

const localizer = momentLocalizer(moment);
const currentHour = new Date().getHours();
const currentMinute = new Date().getMinutes();
const padNumberWith0 = (num) => num.toString().padStart(2, "0");
const defaultStartTime = `${padNumberWith0(currentHour)}:${padNumberWith0(
  currentMinute,
)}`;

Date.prototype.addHours = (h) => {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};

const defaultEndTime = `${padNumberWith0(currentHour + 1)}:${padNumberWith0(
  currentMinute,
)}`;

const formatDate = (date) => {
  return [
    date.getFullYear(),
    padNumberWith0(date.getMonth() + 1),
    padNumberWith0(date.getDate()),
  ].join("-");
};

const App = () => {
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [endDate, setEndDate] = useState(formatDate(new Date()));
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [title, setTitle] = useState("");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const startDateAndTime = new Date(`${startDate}T${startTime}`);
    const endDateAndTime = new Date(`${endDate}T${endTime}`);

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
};

export default App;
