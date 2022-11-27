import React, { MouseEvent, useEffect } from "react";
import EventForm from "./EventForm";
import { useState } from "react";
import FullCalendar, {
  EventClickArg,
  EventSourceInput,
} from "@fullcalendar/react";
import { formatDate, padNumberWith0Zero } from "./lib";
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
import {
  getEntry,
  getEntries,
  createEntry,
  deleteEntry,
  updateEntry,
} from "./hooks";
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

interface formEntryProps {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
}

const App = () => {
  const currentHour: number = new Date().getHours();
  const currentMinute: number = new Date().getMinutes();
  const DEFAULT_START_TIME: string = `${padNumberWith0Zero(
    currentHour
  )}:${padNumberWith0Zero(currentMinute)}`;
  const DEFAULT_END_TIME: string = `${padNumberWith0Zero(
    currentHour + 1
  )}:${padNumberWith0Zero(currentMinute)}`;
  const modalDateFormat = (selectedEventDate: Date) =>
    `${selectedEventDate.toLocaleString("default", {
      weekday: "long",
    })}, ${selectedEventDate.toLocaleString("default", {
      month: "long",
    })} ${selectedEventDate.getDate()}
    ${selectedEventDate.toLocaleTimeString("default", {
      hour: "2-digit",
      minute: "2-digit",
    })}
    `;

  const DEFAULT_DATE = formatDate(new Date());
  const [events, setEvents] = useState<EventSourceInput>([]);
  const [displayedEventData, setDisplayedEventData] = useState(
    {} as DisplayedEventData
  );
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [inEditMode, setInEditMode] = useState<boolean>(false);

  useEffect(() => {
    getEntries().then((entries) => {
      setEvents(entries);
    });
  }, []);

  const handleCreateEntry = async ({
    title,
    startDate,
    endDate,
    startTime,
    endTime,
  }: formEntryProps) => {
    const startTimeUtc = new Date(`${startDate}T${startTime}`);
    const endTimeUtc = new Date(`${endDate}T${endTime}`);
    await createEntry({
      title,
      startTimeUtc,
      endTimeUtc,
    });
    getEntries().then((entries) => {
      setEvents(entries);
    });
  };

  const getEntryDetails = (entryId: string) => {
    getEntry(entryId).then((data) => {
      setDisplayedEventData(data);
      setShowOverlay(true);
      setInEditMode(false);
    });
  };

  const showEventOverlay = (arg: EventClickArg) => {
    const entryId = arg.event._def.extendedProps._id;
    getEntryDetails(entryId);
  };

  const handleDeleteEntry = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await deleteEntry(displayedEventData._id!);
    getEntries().then((entries) => {
      setEvents(entries);
      setShowOverlay(false);
    });
  };

  const handleEditEntry = async (e: MouseEvent<HTMLButtonElement>) => {
    setInEditMode(true);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setInEditMode(false);
  };

  const handleSaveChanges = async ({
    title,
    startDate,
    endDate,
    startTime,
    endTime,
  }: formEntryProps) => {
    const startTimeUtc = new Date(`${startDate}T${startTime}`);
    const endTimeUtc = new Date(`${endDate}T${endTime}`);
    updateEntry(displayedEventData._id, {
      title,
      startTimeUtc,
      endTimeUtc,
    }).then(() => {
      getEntryDetails(displayedEventData._id);
      getEntries().then((entries) => {
        setEvents(entries);
      });
    });
  };

  return (
    <div className="App">
      <Box>
        <div className={s.mainContainer}>
          <div className={s.form}>
            <header className={s.formHeader}>Create an event</header>
            <EventForm
              initialTitle=""
              initialStartDate={DEFAULT_DATE}
              initialEndDate={DEFAULT_DATE}
              initialStartTime={DEFAULT_START_TIME}
              initialEndTime={DEFAULT_END_TIME}
              onSave={handleCreateEntry}
              isCreate={true}
            />
          </div>
          <div className={s.fullCalendarUI}>
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
              height="100vh"
              // editable={true}
              // selectMirror={true}
              // dayMaxEvents={true}
              // weekends={true}
            />
          </div>
        </div>
      </Box>
      <ChakraProvider>
        <Modal isOpen={showOverlay} onClose={closeOverlay}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Event Details</ModalHeader>
            <ModalCloseButton />
            {!inEditMode && (
              <>
                <ModalBody>
                  <p>Event title: {displayedEventData.title}</p>
                  <p>Description: {displayedEventData.description}</p>
                  <p>
                    Start:{" "}
                    {modalDateFormat(new Date(displayedEventData.startTimeUtc))}
                  </p>
                  <p>
                    End:{" "}
                    {modalDateFormat(new Date(displayedEventData.endTimeUtc))}
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button onClick={handleEditEntry} variant="ghost">
                    Edit
                  </Button>
                  <Button onClick={handleDeleteEntry} variant="ghost">
                    Delete
                  </Button>
                </ModalFooter>
              </>
            )}
            {inEditMode && (
              <ModalBody>
                <EventForm
                  initialTitle={displayedEventData.title}
                  initialStartDate={formatDate(
                    new Date(displayedEventData.startTimeUtc)
                  )}
                  initialEndDate={formatDate(
                    new Date(displayedEventData.endTimeUtc)
                  )}
                  initialStartTime={`${padNumberWith0Zero(
                    new Date(displayedEventData.startTimeUtc).getHours()
                  )}:${padNumberWith0Zero(
                    new Date(displayedEventData.startTimeUtc).getMinutes()
                  )}`}
                  initialEndTime={`${padNumberWith0Zero(
                    new Date(displayedEventData.endTimeUtc).getHours()
                  )}:${padNumberWith0Zero(
                    new Date(displayedEventData.endTimeUtc).getMinutes()
                  )}`}
                  onSave={handleSaveChanges}
                  isCreate={false}
                />
              </ModalBody>
            )}
          </ModalContent>
        </Modal>
      </ChakraProvider>
    </div>
  );
};

export default App;
