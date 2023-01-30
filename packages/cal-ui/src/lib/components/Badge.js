import React from "react";
// import FullCalendar from "@fullcalendar/react";

const Badge = (props) => {
  return (
    <div className={`badge ${!props.value ? "badge--none" : ""} `}>
      <h4>{props.value || 0}</h4>
      {/* <FullCalendar
        plugins={[]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
        }}
        events={[]}
        selectable={true}
        selectMirror={true}
        height="100vh"
      /> */}
    </div>
  );
};

export default Badge;
