import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction";
import { v4 as uuid } from "uuid";

function App() {
  const EventItem = ({ info }) => {
    const { event } = info;
    return (
      <div>
        <p>{event.title}</p>
      </div>
    );
  };
  const [events, setEvents] = useState([]);

  const [eventName, setEventName] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [selectedDateInfo, setSelectedDateInfo] = useState({});

  const handleSubmit = () => {
    if (eventName && eventStartTime && eventEndTime && selectedDateInfo) {
      const [startHour, startMin] = eventStartTime.split(":");
      const [endHour, endMin] = eventEndTime.split(":");

      // FullCalendar defaults to midnight the next day as end date
      selectedDateInfo.end.setDate(selectedDateInfo.end.getDate() - 1);

      setEvents([
        ...events,
        {
          start: selectedDateInfo.start.setHours(startHour, startMin),
          end: selectedDateInfo.end.setHours(endHour, endMin),
          title: eventName,
          id: uuid(),
        },
      ]);

      setEventName("");
      setSelectedDateInfo({});
    }
  };

  return (
    <div className="App">
      <p>Enter your event:</p>
      <input onChange={(e) => setEventName(e.target.value)} value={eventName} />
      <input
        type="time"
        onChange={(e) => setEventStartTime(e.target.value)}
        value={eventStartTime}
      />
      <input
        type="time"
        onChange={(e) => setEventEndTime(e.target.value)}
        value={eventEndTime}
      />
      <button onClick={handleSubmit}>Submit</button>
      <FullCalendar
        editable
        headerToolbar={{
          start: "today prev next",
          center: "title",
          end: "dayGridMonth dayGridWeek dayGridDay",
        }}
        events={events}
        selectable
        select={setSelectedDateInfo}
        plugins={[dayGridPlugin, interactionPlugin]}
        views={["dayGridMonth", "dayGridWeek", "dayGridDay"]}
      />
    </div>
  );
}

export default App;
