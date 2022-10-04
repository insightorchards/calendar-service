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

  const handleSelect = (info) => {
    const { start, end } = info;
    const eventNamePrompt = prompt("Enter, event name");
    if (eventNamePrompt) {
      setEvents([
        ...events,
        {
          start,
          end,
          title: eventNamePrompt,
          id: "uuid()",
        },
      ]);
    }
  };
  return (
    <div className="App">
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
