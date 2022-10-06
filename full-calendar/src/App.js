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
  const [selectedInfo, setSelectedInfo] = useState({});

  const handleSubmit = () => {
    if (eventName) {
      console.log("events", events);

      setEvents([
        ...events,
        {
          start: selectedInfo.start,
          end: selectedInfo.end,
          title: eventName,
          id: uuid(),
        },
      ]);

      setEventName("");
      setSelectedInfo({});
    }
  };

  return (
    <div className="App">
      <p>Enter your event:</p>
      <input onChange={(e) => setEventName(e.target.value)} value={eventName} />
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
        select={setSelectedInfo}
        plugins={[dayGridPlugin, interactionPlugin]}
        views={["dayGridMonth", "dayGridWeek", "dayGridDay"]}
      />
    </div>
  );
}

export default App;
