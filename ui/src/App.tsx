import React from "react";
import { Calendar } from "@insightorchards/calendar-ui";

import {
  getEntry,
  getEntries,
  createEntry,
  deleteEntry,
  updateEntry,
} from "./client";

const App = () => {
  return (
    <div className="ParentApp">
      <Calendar
        createEntry={createEntry}
        getEntries={getEntries}
        getEntry={getEntry}
        updateEntry={updateEntry}
        deleteEntry={deleteEntry}
      ></Calendar>
    </div>
  );
};

export default App;
