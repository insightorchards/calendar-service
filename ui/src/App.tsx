import React, { MouseEvent, useEffect } from "react";
import { useState } from "react";
import FullCalendar, {
  EventClickArg,
  EventSourceInput,
  getEntrySpanEnd,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
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
import { getEntry, getEntries, createEntry, deleteEntry } from "./hooks";
import s from "./App.module.css";

interface DisplayedEventData {
  _id: string;
  eventId: string;
  creatorId: string;
  title: string;
  startTimeUtc: string;
  endTimeUtc: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

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
  const [displayedEventData, setDisplayedEventData] = useState(
    {} as DisplayedEventData
  );
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  useEffect(() => {
    getEntries().then((entries) => {
      setEvents(entries);
    });
  }, []);

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

  const handleDeleteEntry = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await deleteEntry(displayedEventData._id!);
    getEntries().then((entries) => {
      setEvents(entries);
      setShowOverlay(false);
    });
  };

  return (
    <div className="App">
      <Box>
        <div>
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
              <Button onClick={handleDeleteEntry} variant="ghost">
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </ChakraProvider>

      <label htmlFor="title">Title</label>
      <input
        id="title"
        type="text"
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        value={title}
      />

      <label htmlFor="startDate">Start Date</label>
      <input
        id="startDate"
        min={formatDate(new Date())}
        type="date"
        onChange={(e) => {
          setStartDate(e.target.value);
        }}
        value={startDate}
      />
      <label htmlFor="startTime">Start Time</label>
      <input
        id="startTime"
        type="time"
        onChange={(e) => {
          setStartTime(e.target.value);
        }}
        value={startTime}
      />
      <label htmlFor="endDate">End Date</label>
      <input
        id="endDate"
        min={startDate}
        type="date"
        onChange={(e) => {
          setEndDate(e.target.value);
        }}
        value={endDate}
      />
      <label htmlFor="endTime">End Time</label>
      <input
        id="endTime"
        type="time"
        onChange={(e) => {
          setEndTime(e.target.value);
        }}
        value={endTime}
      />
      <button onClick={(e) => handleSubmit(e)}>Create Event</button>
      {error && <p className={s.error}>{error}</p>}
    </div>
  );
};

export default App;
