import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import {
  addDayToAllDayEvent,
  dateMinusOneDay,
  datePlusHours,
  formatDate,
  getDateTimeString,
  modalDateFormat,
  oneYearLater,
} from "../helpers/lib";
import { IconButton } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import s from "./Calendar.module.css";

const Calendar = ({ events }) => {
  const DEFAULT_START = datePlusHours(new Date(), 1).toISOString();
  const DEFAULT_END = datePlusHours(new Date(), 2).toISOString();

  const [modalStart, setModalStart] = useState(DEFAULT_START);
  const [modalEnd, setModalEnd] = useState(DEFAULT_END);

  const [showOverlay, setShowOverlay] = useState(false);
  const [inCreateMode, setInCreateMode] = useState(false);
  const [modalAllDay, setModalAllDay] = useState(false);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  return (
    <div className={s.mainContainer}>
      <div className={s.fullCalendarUI}>
        <div className={s.addEventButton}>
          <IconButton
            backgroundColor="gray.300"
            aria-label="add event"
            size="lg"
            icon={<AddIcon boxSize={7} w={7} h={7} />}
            onClick={() => {
              setModalStart(DEFAULT_START);
              setModalEnd(DEFAULT_END);
              setInCreateMode(true);
              setShowOverlay(true);
            }}
          />
        </div>
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          initialView="dayGridMonth"
          selectable={true}
          eventClick={() => {}}
          // eventClick={openModal}
          select={({ start, end, allDay }) => {
            setModalAllDay(allDay);
            setModalStart(start.toISOString());

            if (allDay) {
              setModalEnd(dateMinusOneDay(end).toISOString());
            } else {
              setModalEnd(end.toISOString());
            }

            setInCreateMode(true);
            setShowOverlay(true);
          }}
          selectMirror={true}
          height="100vh"
          datesSet={(e) => {
            setRangeStart(new Date(e.startStr).toISOString());
            setRangeEnd(new Date(e.endStr).toISOString());
          }}
          eventDataTransform={addDayToAllDayEvent}
        />
      </div>
    </div>
  );
};

export default Calendar;
