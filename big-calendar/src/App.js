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
  const [events, setEvents] = useState([]);

  // issue: With big-calenders UI the event that gets added will show up on the start date up until the end date but not on the end date it's self.
  // solution: In order to resolve this issue, end date is modified to be a day past the specified end date.
  // result: As a result the UI now shows the event ending on the end date specified rather than the day before.
  const modifyEndDateToIncludeEndDateSelectedInPicker = () => {
    let result;
    const arrayOfEndDateValues = endDate.split("-");
    arrayOfEndDateValues.splice(2, 1, parseInt(endDate.split("-")[2]) + 1)
    result = arrayOfEndDateValues.join("-")
    return result
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setEvents([{
      title: title,
      start: startDate,
      end: modifyEndDateToIncludeEndDateSelectedInPicker(),
    }])
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
