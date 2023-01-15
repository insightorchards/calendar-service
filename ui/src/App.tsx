import EventForm from "./EventForm";
import React, { MouseEvent, useEffect } from "react";
import { useState } from "react";
import FullCalendar, {
  EventClickArg,
  EventSourceInput,
} from "@fullcalendar/react";
import {
  addDayToAllDayEvent,
  dateMinusOneDay,
  datePlusHours,
  formatDate,
  getDateTimeString,
  modalDateFormat,
  oneYearLater,
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
  recurrenceEndsUtc: string;
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
  recurrenceEnds?: string;
}

const App = () => {
  const DEFAULT_START = datePlusHours(new Date(), 1).toISOString();
  const DEFAULT_END = datePlusHours(new Date(), 2).toISOString();

  const [events, setEvents] = useState<EventSourceInput>([]);
  const [displayedEventData, setDisplayedEventData] = useState(
    {} as DisplayedEventData,
  );
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [inEditMode, setInEditMode] = useState<boolean>(false);
  const [inCreateMode, setInCreateMode] = useState<boolean>(false);

  const [modalStart, setModalStart] = useState<string>(DEFAULT_START);
  const [modalEnd, setModalEnd] = useState<string>(DEFAULT_END);

  const [modalAllDay, setModalAllDay] = useState<boolean>(false);
  const [apiError, setApiError] = useState<boolean>(false);
  const [rangeStart, setRangeStart] = useState<string>("");
  const [rangeEnd, setRangeEnd] = useState<string>("");

  const flashApiErrorMessage = () => {
    setApiError(true);
    setTimeout(() => setApiError(false), 4000);
  };

  useEffect(() => {
    getEntries(rangeStart, rangeEnd)
      .then((entries) => {
        setEvents(entries);
      })
      .catch(() => {
        flashApiErrorMessage();
      });
  }, [rangeStart, rangeEnd]);

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
    let recurrenceEndUtc;
    if (recurrenceEnds) {
      recurrenceEndUtc = new Date(getDateTimeString(recurrenceEnds, startTime));
    }

    await createEntry({
      title,
      description,
      startTimeUtc,
      endTimeUtc,
      allDay,
      recurring,
      frequency,
      recurrenceBegins,
      recurrenceEndUtc,
    }).catch(() => {
      flashApiErrorMessage();
    });
    getEntries(rangeStart, rangeEnd)
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
        getEntries(rangeStart, rangeEnd).then((entries) => {
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
    let recurrenceEndUtc;
    if (recurrenceEnds) {
      recurrenceEndUtc = new Date(getDateTimeString(recurrenceEnds, startTime));
    }

    updateEntry(entryId, {
      title,
      description,
      startTimeUtc,
      endTimeUtc,
      allDay,
      recurring,
      frequency,
      recurrenceBegins,
      recurrenceEndUtc,
    })
      .then(() => {
        getEntryDetails(entryId);
        getEntries(rangeStart, rangeEnd).then((entries) => {
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
                      setModalStart(DEFAULT_START);
                      setModalEnd(DEFAULT_END);
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
                      {displayedEventData.allDay ? "All Day" : ""}
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
                    initialStart={displayedEventData.startTimeUtc}
                    initialEnd={displayedEventData.endTimeUtc}
                    initialAllDay={displayedEventData.allDay}
                    initialRecurring={displayedEventData.recurring}
                    initialRecurrenceEnd={formatDate(
                      new Date(displayedEventData.recurrenceEndsUtc),
                    )}
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
                    initialStart={modalStart}
                    initialEnd={modalEnd}
                    initialAllDay={modalAllDay}
                    initialRecurring={false}
                    initialRecurrenceEnd={oneYearLater(
                      modalStart,
                    ).toISOString()}
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
