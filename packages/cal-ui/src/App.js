import Calendar from "./lib/components/Calendar";
import "./App.css";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "5rem",
      }}
    >
      <p>Wow, look at this component library.</p>
      <h5>Here's a calendar:</h5>
      <Calendar />
    </div>
  );
}

export default App;
