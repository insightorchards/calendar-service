import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction";

function App() {
  const EventItem = ({ info }) => {
    const { event } = info;
    return (
      <div>
        <p>{event.title}</p>
      </div>
    );
  };
  const [events, setEvents] = useState([
    {
      start: new Date(),
      end: new Date(),
      title: "Unicorn",
      id: "uuid()",
    }
  ]);

  const [eventName, setEventName] = useState("")

  const handleSelect = (info) => {
    const { start, end } = info;
    if (eventName) {
      setEvents([
        ...events,
        {
          start,
          end,
          title: eventName,
          id: "uuid()",
        },
      ]);
    }
  };
  return (
    <div className="App">
      <p>Enter your event:</p>
      <input onChange = {e => setEventName(e.target.value) }/>
      <FullCalendar
      editable
        headerToolbar={{
          start: "today prev next",
          center: "title",
          end: "dayGridMonth dayGridWeek dayGridDay",
        }}
        events={events}
        eventContent={(info) => <EventItem info={info} />}
        selectable
        select={handleSelect}
        plugins={[dayGridPlugin, interactionPlugin]}
        views={["dayGridMonth", "dayGridWeek", "dayGridDay"]}
      />
    </div>
  );
}

export default App;
