import React, { MouseEvent, useEffect } from "react";
import { useState } from "react";
import FullCalendar, {
  EventClickArg,
  EventSourceInput,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { getEntry, getEntries, createEntry } from "./fetchers";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  ChakraProvider,
} from "@chakra-ui/react";
import s from "./App.module.css";

const App = () => {
  const currentHour: number = new Date().getHours();
  const currentMinute: number = new Date().getMinutes();
  const padNumberWith0Zero: Function = (num: Number): string =>
    num.toString().padStart(2, "0");
  const DEFAULT_START_TIME: string = `${padNumberWith0Zero(
    currentHour
  )}:${padNumberWith0Zero(currentMinute)}`;
  const DEFAULT_END_TIME: string = `${padNumberWith0Zero(
    currentHour + 1
  )}:${padNumberWith0Zero(currentMinute)}`;

  const formatDate: Function = (date: Date): string => {
    return [
      date.getFullYear(),
      padNumberWith0Zero(date.getMonth() + 1),
      padNumberWith0Zero(date.getDate()),
    ].join("-");
  };
  const DEFAULT_DATE = formatDate(new Date());

  const [startDate, setStartDate] = useState<string>(DEFAULT_DATE);
  const [endDate, setEndDate] = useState<string>(DEFAULT_DATE);
  const [startTime, setStartTime] = useState<string>(DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState<string>(DEFAULT_END_TIME);
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventSourceInput>([]);

  useEffect(() => {
    getEntries().then((entries) => {
      setEvents(entries);
    });
  }, []);

  const [displayedEventData, setDisplayedEventData] = useState<any>({});
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  const handleCreateEntry = async () => {
    const startTimeUtc = new Date(`${startDate}T${startTime}`);
    const endTimeUtc = new Date(`${endDate}T${endTime}`);
    createEntry({
      title,
      startTimeUtc,
      endTimeUtc,
    });
  };

  const handleSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const startDateAndTime: string = `${startDate}T${startTime}`;
    const endDateAndTime: string = `${endDate}T${endTime}`;
    if (startDateAndTime > endDateAndTime) {
      setError("Error: end cannot be before start.");
      return;
    }
    handleCreateEntry();
    getEntries().then((entries) => {
      setEvents(entries);
    });

    setTitle("");
    setError(null);
    setStartDate(DEFAULT_DATE);
    setEndDate(DEFAULT_DATE);
    setStartTime(DEFAULT_START_TIME);
    setEndTime(DEFAULT_END_TIME);
  };

  const showEventOverlay = (arg: EventClickArg) => {
    const entryId = arg.event._def.extendedProps._id;
    getEntry(entryId).then((data) => {
      setDisplayedEventData(data);
      setShowOverlay(true);
    });
  };

  return (
    <div className="App">
      <Box>
        <div>
          <div className={s.form}>
            <label htmlFor="title" className={s.formItem}>
              Title
              <input
                className={s.formInput}
                id="title" // change this name to titleInput instead of title
                type="text"
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                value={title}
              />
            </label>

            <label htmlFor="startDate" className={s.formItem}>
              Start Date
              <input
                id="startDate"
                min={formatDate(new Date())}
                type="date"
                onChange={(e) => {
                  setStartDate(e.target.value);
                }}
                value={startDate}
              />
            </label>
            <label htmlFor="startTime" className={s.formItem}>
              Start Time
              <input
                id="startTime"
                type="time"
                onChange={(e) => {
                  setStartTime(e.target.value);
                }}
                value={startTime}
              />
            </label>
            <label htmlFor="endDate" className={s.formItem}>
              End Date
              <input
                id="endDate"
                min={startDate}
                type="date"
                onChange={(e) => {
                  setEndDate(e.target.value);
                }}
                value={endDate}
              />
            </label>
            <label htmlFor="endTime" className={s.formItem}>
              End Time
              <input
                id="endTime"
                type="time"
                onChange={(e) => {
                  setEndTime(e.target.value);
                }}
                value={endTime}
              />
            </label>
            <button onClick={(e) => handleSubmit(e)}>Create Event</button>
            {error && <p className={s.error}>{error}</p>}
          </div>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            initialView="dayGridMonth"
            selectable={true}
            eventClick={showEventOverlay}
            // editable={true}
            // selectMirror={true}
            // dayMaxEvents={true}
            // weekends={true}
          />
        </div>
      </Box>
      <ChakraProvider>
        <Modal isOpen={showOverlay} onClose={() => setShowOverlay(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Event Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <p>Event title: {displayedEventData.title}</p>
              <p>Description: {displayedEventData.description}</p>
              <p>
                Start: {new Date(displayedEventData.startTimeUtc).toString()}
              </p>
              <p>End: {new Date(displayedEventData.endTimeUtc).toString()}</p>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost">Delete</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </ChakraProvider>
    </div>
  );
};

export default App;
