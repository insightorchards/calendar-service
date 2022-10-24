import React, { MouseEvent } from "react";
// import moment from "moment";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
// import interactionPlugin from "@fullcalendar/interaction";
// import { Calendar, momentLocalizer } from "react-big-calendar";
// import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarEvent } from "./configs/CalendarEvent";
import s from "./App.module.css";

const App = () => {
  const currentHour: number = new Date().getHours();
  const currentMinute: number = new Date().getMinutes();
  const padNumberWith0Zero: Function = (num: Number): string =>
    num.toString().padStart(2, "0");
  const DEFAULT_START_TIME: string = `${padNumberWith0Zero(
    currentHour
  )}:${padNumberWith0Zero(currentMinute)}`;
  const DEFAULT_END_TIME: string = `${padNumberWith0Zero(
    currentHour + 1
  )}:${padNumberWith0Zero(currentMinute)}`;

  // const localizer = momentLocalizer(moment);

  const formatDate: Function = (date: Date): string => {
    return [
      date.getFullYear(),
      padNumberWith0Zero(date.getMonth() + 1),
      padNumberWith0Zero(date.getDate()),
    ].join("-");
  };
  const DEFAULT_DATE = formatDate(new Date());

  const [startDate, setStartDate] = useState<string>(DEFAULT_DATE);
  const [endDate, setEndDate] = useState<string>(DEFAULT_DATE);
  const [startTime, setStartTime] = useState<string>(DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState<string>(DEFAULT_END_TIME);
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const handleSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    console.log("inside handleSubmit");
    e.preventDefault();
    const startDateAndTime: Date = new Date(`${startDate}T${startTime}`);
    const endDateAndTime: Date = new Date(`${endDate}T${endTime}`);
    console.log(startDateAndTime, endDateAndTime, startDate, endDate);
    if (startDateAndTime > endDateAndTime) {
      setError("Error: end cannot be before start.");
      return;
    }

    setEvents([
      {
        title: title,
        start: "2022-10-24",
        end: "2022-10-25",
      },
    ]);
    setTitle("");
    setError(null);
    setStartDate(DEFAULT_DATE);
    setEndDate(DEFAULT_DATE);
    setStartTime(DEFAULT_START_TIME);
    setEndTime(DEFAULT_END_TIME);
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
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={[
            {
              title: "My event",
              start: "2022-10-24T08:00:00.000Z",
              end: "2022-10-26T00:10:00.000Z",
            },
          ]}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          // initialEvents={INITIAL_EVENTS} // alternatively, use the `events` setting to fetch from a feed
          // select={this.handleDateSelect}
          // eventContent={renderEventContent} // custom render function
          // eventClick={this.handleEventClick}
          // eventsSet={this.handleEvents} // called after events are initialized/added/changed/removed
          /* you can update a remote database when these fire:
          eventAdd={function(){}}
          eventChange={function(){}}
          eventRemove={function(){}}
          */
        />
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
