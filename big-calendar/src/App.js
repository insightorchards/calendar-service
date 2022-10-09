import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "./App.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

const localizer = momentLocalizer(moment);
const currentHour = new Date().getHours();
const nextHour = currentHour + 1;
const currentMinutes = new Date().getMinutes();
const formatToHourAndMinutes = (time) => time + ":00:00.000";
const defaultStartTime =
  currentMinutes > 0
    ? formatToHourAndMinutes(nextHour)
    : formatToHourAndMinutes(currentHour);
const defaultEndTime = formatToHourAndMinutes(nextHour + 1);

const events = [
  {
    title: "Beetha's Birthday",
    start: new Date(),
    end: new Date(),
  },
];

function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

function formatDate(date) {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join("-");
}

function App() {
  const [startDate, setStartDate] = useState(formatDate(new Date())); // may set this to a Date object later.
  const [endDate, setEndDate] = useState(formatDate(new Date()));
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("You clicked submit.");
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
        type="date"
        onChange={(e) => {
          setStartDate(e.target.value);
          setEndDate(e.target.value);
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
    </div>
  );
}

export default App;
