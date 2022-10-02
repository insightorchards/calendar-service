import React, { useState } from "react";
import Calendar from "react-calendar";
import "./Calendar.css";
import "./App.css";

function App() {
  const [value, onChange] = useState(new Date());
  return (
    <div className="container">
      <Calendar className="calendar" onChange={onChange} value={value} />
    </div>
  );
}

export default App;
