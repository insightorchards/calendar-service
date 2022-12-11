import React, { MouseEvent, useEffect } from "react";
import EventForm from "./EventForm";
import { useState } from "react";
import FullCalendar, {
  EventClickArg,
  EventSourceInput,
} from "@fullcalendar/react";
import {
  formatDate,
  getDateTimeString,
  padNumberWith0Zero,
  formatTime,
  modalDateFormat,
} from "./lib";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  CloseButton,
  IconButton,
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
} from "./client";
import s from "./App.module.css";

interface DisplayedEventData {
  _id: string;
  eventId: string;
  creatorId: string;
  title: string;
  description: string;
  startTimeUtc: string;
  endTimeUtc: string;
  allDay: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormEntryProps {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
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
  const DEFAULT_DATE = formatDate(new Date());

  const [events, setEvents] = useState<EventSourceInput>([]);
  const [displayedEventData, setDisplayedEventData] = useState(
    {} as DisplayedEventData
  );
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [inEditMode, setInEditMode] = useState<boolean>(false);
  const [showMobileEventForm, setShowMobileEventForm] =
    useState<boolean>(false);

  useEffect(() => {
    getEntries().then((entries) => {
      setEvents(entries);
    });
  }, []);

  const handleCreateEntry = async ({
    title,
    description,
    startDate,
    endDate,
    startTime,
    endTime,
    allDay,
  }: FormEntryProps) => {
    const startTimeUtc = new Date(getDateTimeString(startDate, startTime));
    const endTimeUtc = new Date(getDateTimeString(endDate, endTime));
    await createEntry({
      title,
      description,
      startTimeUtc,
      endTimeUtc,
      allDay,
    });
    getEntries().then((entries) => {
      setEvents(entries);
      setShowMobileEventForm(false);
    });
  };

  const getEntryDetails = (entryId: string) => {
    getEntry(entryId).then((data) => {
      setDisplayedEventData(data);
      setShowOverlay(true);
      setInEditMode(false);
    });
  };

  const openModal = (arg: EventClickArg) => {
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

  const handleEditEntry = () => setInEditMode(true);

  const handleCancel = () => setShowMobileEventForm(false);

  const closeOverlay = () => {
    setShowOverlay(false);
    setInEditMode(false);
  };

  const handleSaveChanges = async ({
    title,
    description,
    startDate,
    endDate,
    startTime,
    endTime,
    allDay,
  }: FormEntryProps) => {
    const entryId = displayedEventData._id;
    const startTimeUtc = new Date(getDateTimeString(startDate, startTime));
    const endTimeUtc = new Date(getDateTimeString(endDate, endTime));
    updateEntry(entryId, {
      title,
      description,
      startTimeUtc,
      endTimeUtc,
      allDay,
    }).then(() => {
      getEntryDetails(entryId);
      getEntries().then((entries) => {
        setEvents(entries);
      });
    });
  };

  return (
    <div className="App">
      <ChakraProvider>
        <Box>
          <div className={s.mainContainer}>
            <div className={`${s.form} ${showMobileEventForm ? s.active : ""}`}>
              <header className={s.header}>Create an event</header>
              <div className={s.closeButton}>
                <CloseButton size="md" onClick={handleCancel} />
              </div>
              <EventForm
                initialTitle=""
                initialDescription=""
                initialStartDate={DEFAULT_DATE}
                initialEndDate={DEFAULT_DATE}
                initialStartTime={DEFAULT_START_TIME}
                initialEndTime={DEFAULT_END_TIME}
                initialAllDay={false}
                onFormSubmit={handleCreateEntry}
                isCreate={true}
              />
            </div>
            <div className={s.fullCalendarUI}>
              <div className={s.addEventButton}>
                <IconButton
                  aria-label="add event"
                  icon={<AddIcon boxSize={5} w={5} h={5} />}
                  onClick={() => {
                    setShowMobileEventForm(true);
                  }}
                />
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
                eventClick={openModal}
                height="100vh"
                // editable={true}
                // selectMirror={true}
                // dayMaxEvents={true}
                // weekends={true}
              />
            </div>
          </div>
        </Box>

        <Modal isOpen={showOverlay} onClose={closeOverlay}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <p className={s.title}>{displayedEventData.title}</p>
            </ModalHeader>
            <ModalCloseButton />
            {!inEditMode && (
              <>
                <ModalBody>
                  <div className={s.eventDetails}>
                    <p>{displayedEventData.description}</p>
                    <p>
                      {" "}
                      {modalDateFormat({
                        startTimeUtc: displayedEventData.startTimeUtc,
                        endTimeUtc: displayedEventData.endTimeUtc,
                        allDay: displayedEventData.allDay,
                      })}
                    </p>
                    <div className={s.allDay}>
                      {displayedEventData.allDay ? "all day" : ""}
                    </div>
                  </div>
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
                  initialDescription={displayedEventData.description}
                  initialStartDate={formatDate(
                    new Date(displayedEventData.startTimeUtc)
                  )}
                  initialEndDate={formatDate(
                    new Date(displayedEventData.endTimeUtc)
                  )}
                  initialStartTime={formatTime(displayedEventData.startTimeUtc)}
                  initialEndTime={formatTime(displayedEventData.endTimeUtc)}
                  initialAllDay={displayedEventData.allDay}
                  onFormSubmit={handleSaveChanges}
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
