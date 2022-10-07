import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import './App.css';
import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = momentLocalizer(moment)

// title?: React.ReactNode | undefined;
//     start?: Date | undefined;
//     end?: Date | undefined;

const events = [
  {
    title: "Beetha's Birthday",
    start: new Date(),
    end: new Date()
  }
]

function App() {
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
    </div>
  );
}

export default App;
