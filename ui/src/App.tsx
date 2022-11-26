import React, { MouseEvent, useEffect } from "react";
import { useState } from "react";
import FullCalendar, {
  EventClickArg,
  EventSourceInput,
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
    currentHour,
  )}:${padNumberWith0Zero(currentMinute)}`;
  const DEFAULT_END_TIME: string = `${padNumberWith0Zero(
    currentHour + 1,
  )}:${padNumberWith0Zero(currentMinute)}`;

  const formatDate: Function = (date: Date): string => {
    return [
      date.getFullYear(),
      padNumberWith0Zero(date.getMonth() + 1),
      padNumberWith0Zero(date.getDate()),
    ].join("-");
  };

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

  const [startDate, setStartDate] = useState<string>(DEFAULT_DATE);
  const [endDate, setEndDate] = useState<string>(DEFAULT_DATE);
  const [startTime, setStartTime] = useState<string>(DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState<string>(DEFAULT_END_TIME);
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventSourceInput>([]);
  const [displayedEventData, setDisplayedEventData] = useState(
    {} as DisplayedEventData,
  );
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [inEditMode, setInEditMode] = useState<boolean>(false);

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

  const handleEditEntry = async (e: MouseEvent<HTMLButtonElement>) => {
    setInEditMode(true);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setInEditMode(false);
  };

  const handleSaveChanges = () => {
    console.log("update entry");
  };

  return (
    <div className="App">
      <Box>
        <div className={s.mainContainer}>
          <div className={s.form}>
            <header className={s.formHeader}>Create an event</header>
            <div className={s.formInputs}>
              <label htmlFor="title" className={s.formItem}>
                Title
                <input
                  className={s.formTitleInput}
                  id="title" // change this name to titleInput instead of title
                  type="text"
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  value={title}
                />
              </label>
              <div className={s.inputGroup}>
                <label htmlFor="startDate" className={s.formItem}>
                  Start Date
                  <input
                    className={s.formInput}
                    id="startDate"
                    min={formatDate(new Date())}
                    type="date"
                    onChange={(e) => {
                      setStartDate(e.target.value);
                    }}
                    value={startDate}
                  />
                </label>
                <label htmlFor="endDate" className={s.formItem}>
                  End Date
                  <input
                    className={s.formInput}
                    id="endDate"
                    min={startDate}
                    type="date"
                    onChange={(e) => {
                      setEndDate(e.target.value);
                    }}
                    value={endDate}
                  />
                </label>
              </div>
              <div className={s.inputGroup}>
                <label htmlFor="startTime" className={s.formItem}>
                  Start Time
                  <input
                    className={s.formInput}
                    id="startTime"
                    type="time"
                    onChange={(e) => {
                      setStartTime(e.target.value);
                    }}
                    value={startTime}
                  />
                </label>
                <label htmlFor="endTime" className={s.formItem}>
                  End Time
                  <input
                    className={s.formInput}
                    id="endTime"
                    type="time"
                    onChange={(e) => {
                      setEndTime(e.target.value);
                    }}
                    value={endTime}
                  />
                </label>
              </div>
            </div>
            <button className={s.formSubmit} onClick={(e) => handleSubmit(e)}>
              Create Event
            </button>
            {error && <p className={s.error}>{error}</p>}
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
            )}
            {inEditMode && (
              <ModalBody>
                <div className={s.formInputs}>
                  <label htmlFor="title" className={s.formItem}>
                    Title
                    <input
                      className={s.formTitleInput}
                      id="title" // change this name to titleInput instead of title
                      type="text"
                      onChange={(e) => {
                        setTitle(e.target.value);
                      }}
                      value={displayedEventData.title}
                    />
                  </label>
                  <div className={s.inputGroup}>
                    <label htmlFor="startDate" className={s.formItem}>
                      Start Date
                      <input
                        className={s.formInput}
                        id="startDate"
                        min={formatDate(new Date())}
                        type="date"
                        onChange={(e) => {
                          setStartDate(e.target.value);
                        }}
                        value={formatDate(
                          new Date(displayedEventData.startTimeUtc),
                        )}
                      />
                    </label>
                    <label htmlFor="endDate" className={s.formItem}>
                      End Date
                      <input
                        className={s.formInput}
                        id="endDate"
                        min={startDate}
                        type="date"
                        onChange={(e) => {
                          setEndDate(e.target.value);
                        }}
                        value={formatDate(
                          new Date(displayedEventData.endTimeUtc),
                        )}
                      />
                    </label>
                  </div>
                  <div className={s.inputGroup}>
                    <label htmlFor="startTime" className={s.formItem}>
                      Start Time
                      <input
                        className={s.formInput}
                        id="startTime"
                        type="time"
                        onChange={(e) => {
                          setStartTime(e.target.value);
                        }}
                        value={`${padNumberWith0Zero(
                          new Date(displayedEventData.startTimeUtc).getHours(),
                        )}:${padNumberWith0Zero(
                          new Date(
                            displayedEventData.startTimeUtc,
                          ).getMinutes(),
                        )}`}
                      />
                    </label>
                    <label htmlFor="endTime" className={s.formItem}>
                      End Time
                      <input
                        className={s.formInput}
                        id="endTime"
                        type="time"
                        onChange={(e) => {
                          setEndTime(e.target.value);
                        }}
                        value={`${padNumberWith0Zero(
                          new Date(displayedEventData.endTimeUtc).getHours(),
                        )}:${padNumberWith0Zero(
                          new Date(displayedEventData.endTimeUtc).getMinutes(),
                        )}`}
                      />
                    </label>
                  </div>
                </div>
              </ModalBody>
            )}

            <ModalFooter>
              <Button onClick={handleSaveChanges} variant="ghost">
                Save
              </Button>
              <Button onClick={handleEditEntry} variant="ghost">
                Edit
              </Button>
              <Button onClick={handleDeleteEntry} variant="ghost">
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </ChakraProvider>
    </div>
  );
};

export default App;
