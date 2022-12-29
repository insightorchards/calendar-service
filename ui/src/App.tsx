import EventForm from "./EventForm";
import React, { MouseEvent, useEffect } from "react";
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
  addDayToAllDayEvent,
  formatDateMinusOneDay,
} from "./lib";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { AddIcon } from "@chakra-ui/icons";

import {
  Alert,
  AlertIcon,
  AlertDescription,
  Box,
  Button,
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
  recurring: boolean;
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
  recurring: boolean;
  frequency?: string;
  recurrenceBegins?: Date;
  recurrenceEnds?: Date;
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
  const [inCreateMode, setInCreateMode] = useState<boolean>(false);
  const [modalStartDate, setModalStartDate] = useState<string>("");
  const [modalEndDate, setModalEndDate] = useState<string>("");
  const [modalStartTime, setModalStartTime] =
    useState<string>(DEFAULT_START_TIME);
  const [modalEndTime, setModalEndTime] = useState<string>(DEFAULT_END_TIME);
  const [modalAllDay, setModalAllDay] = useState<boolean>(false);
  const [apiError, setApiError] = useState<boolean>(false);

  const flashApiErrorMessage = () => {
    setApiError(true);
    setTimeout(() => setApiError(false), 4000);
  };

  useEffect(() => {
    getEntries()
      .then((entries) => {
        setEvents(entries);
      })
      .catch(() => {
        flashApiErrorMessage();
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
    recurring,
    frequency,
    recurrenceBegins,
    recurrenceEnds,
  }: FormEntryProps) => {
    const startTimeUtc = new Date(getDateTimeString(startDate, startTime));
    const endTimeUtc = new Date(getDateTimeString(endDate, endTime));

    await createEntry({
      title,
      description,
      startTimeUtc,
      endTimeUtc,
      allDay,
      recurring,
      frequency,
      recurrenceBegins,
      recurrenceEnds,
    }).catch(() => {
      flashApiErrorMessage();
    });
    getEntries()
      .then((entries) => {
        setEvents(entries);
        setShowOverlay(false);
        setInCreateMode(false);
      })
      .catch(() => {
        flashApiErrorMessage();
      });
  };

  const getEntryDetails = (entryId: string) => {
    getEntry(entryId)
      .then((data) => {
        setDisplayedEventData(data);
        setShowOverlay(true);
        setInEditMode(false);
      })
      .catch(() => {
        setShowOverlay(false);
        flashApiErrorMessage();
      });
  };

  const openModal = (arg: EventClickArg) => {
    const entryId = arg.event._def.extendedProps._id;
    getEntryDetails(entryId);
  };

  const handleDeleteEntry = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    deleteEntry(displayedEventData._id!)
      .then(() => {
        getEntries().then((entries) => {
          setEvents(entries);
          setShowOverlay(false);
        });
      })
      .catch(() => {
        setShowOverlay(false);
        flashApiErrorMessage();
      });
  };

  const handleEditEntry = () => setInEditMode(true);

  const closeOverlay = () => {
    setShowOverlay(false);
    setInEditMode(false);
    setInCreateMode(false);
  };

  const handleSaveChanges = async ({
    title,
    description,
    startDate,
    endDate,
    startTime,
    endTime,
    allDay,
    recurring,
    frequency,
    recurrenceBegins,
    recurrenceEnds,
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
      recurring,
      frequency,
      recurrenceBegins,
      recurrenceEnds,
    })
      .then(() => {
        getEntryDetails(entryId);
        getEntries().then((entries) => {
          setEvents(entries);
        });
      })
      .catch(() => {
        setShowOverlay(false);
        flashApiErrorMessage();
      });
  };

  return (
    <div className="App">
      <ChakraProvider>
        <Box>
          {apiError && (
            <Alert status="error" justifyContent="center">
              <AlertIcon />
              <AlertDescription>Oops! Something went wrong.</AlertDescription>
            </Alert>
          )}

          <div className={s.mainContainer}>
            <div className={s.fullCalendarUI}>
              <div className={s.leftSidePanel}>
                <div>
                  <IconButton
                    aria-label="add event"
                    size="lg"
                    icon={<AddIcon boxSize={7} w={7} h={7} />}
                    onClick={() => {
                      setModalStartDate(DEFAULT_DATE);
                      setModalEndDate(DEFAULT_DATE);
                      setModalStartTime(DEFAULT_START_TIME);
                      setModalEndTime(DEFAULT_END_TIME);
                      setInCreateMode(true);
                      setShowOverlay(true);
                    }}
                  />
                </div>
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
                eventClick={openModal}
                select={({ start, end, allDay }) => {
                  setModalAllDay(allDay);

                  setModalStartDate(formatDate(start));
                  if (allDay) {
                    setModalEndDate(formatDateMinusOneDay(end));
                  } else {
                    setModalEndDate(formatDate(end));
                  }

                  setModalStartTime(formatTime(start.toUTCString()));
                  setModalEndTime(formatTime(end.toUTCString()));

                  setInCreateMode(true);
                  setShowOverlay(true);
                }}
                selectMirror={true}
                height="100vh"
                eventDataTransform={addDayToAllDayEvent}
              />
            </div>
          </div>
        </Box>

        <Modal isOpen={showOverlay} onClose={closeOverlay}>
          <ModalOverlay />
          <ModalContent>
            {!inEditMode && !inCreateMode && (
              <>
                <ModalHeader>{displayedEventData.title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <div className={s.eventDetails}>
                    <p>{displayedEventData.description}</p>
                    <p className={s.eventDetailsTime}>
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
              <>
                <ModalHeader>Edit event</ModalHeader>
                <ModalCloseButton />
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
                    initialStartTime={formatTime(
                      displayedEventData.startTimeUtc
                    )}
                    initialEndTime={formatTime(displayedEventData.endTimeUtc)}
                    initialAllDay={displayedEventData.allDay}
                    initialRecurring={displayedEventData.recurring}
                    onFormSubmit={handleSaveChanges}
                    isCreate={false}
                  />
                </ModalBody>
              </>
            )}
            {inCreateMode && (
              <>
                <ModalHeader>Create event</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <EventForm
                    initialTitle=""
                    initialDescription=""
                    initialStartDate={modalStartDate}
                    initialEndDate={modalEndDate}
                    initialStartTime={modalStartTime}
                    initialEndTime={modalEndTime}
                    initialAllDay={modalAllDay}
                    initialRecurring={false}
                    onFormSubmit={handleCreateEntry}
                    isCreate={true}
                  />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </ChakraProvider>
    </div>
  );
};

export default App;
