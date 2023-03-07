import React, { useEffect, useState } from "react";
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
import { AddIcon } from "@chakra-ui/icons";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import EventForm, { FORM_MODE } from "./EventForm";
import s from "./Calendar.module.css";

const Calendar = ({
  createEntry = async () => {},
  getEntries = async () => {},
  getEntry = async () => {},
  updateEntry = async () => {},
  deleteEntry = async () => {},
}) => {
  const DEFAULT_START = datePlusHours(new Date(), 1).toISOString();
  const DEFAULT_END = datePlusHours(new Date(), 2).toISOString();

  const [events, setEvents] = useState();
  const [modalStart, setModalStart] = useState(DEFAULT_START);
  const [modalEnd, setModalEnd] = useState(DEFAULT_END);

  const [showOverlay, setShowOverlay] = useState(false);
  const [inCreateMode, setInCreateMode] = useState(false);
  const [inEditMode, setInEditMode] = useState(false);
  const [modalAllDay, setModalAllDay] = useState(false);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [apiError, setApiError] = useState(false);
  const [pendingEdits, setPendingEdits] = useState({});
  const [editingSeries, setEditingSeries] = useState(false)

  const [showDeletionSelectionScreen, setShowDeletionSelectionScreen] =
    useState(false);
  const [showEditSelectionScreen, setShowEditSelectionScreen] = useState(false);

  const [displayedEventData, setDisplayedEventData] = useState({});

  useEffect(() => {
    getEntries(rangeStart, rangeEnd)
      .then((entries) => {
        setEventsWithStart(entries);
      })
      .catch((err) => {
        console.log("Error:", err.message)
        flashApiErrorMessage();
      });
  }, [getEntries, rangeStart, rangeEnd]);

  const flashApiErrorMessage = () => {
    setApiError(true);
    setTimeout(() => setApiError(false), 4000);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setInEditMode(false);
    setInCreateMode(false);
    setShowDeletionSelectionScreen(false);
    setShowEditSelectionScreen(false);
  };

  const setEventsWithStart = (events) => {
    // We need to manually set the entryStart field
    // so we can read it off the object later
    // See https://fullcalendar.io/docs/event-parsing
    // Can't use the 'start' field because it gets truncated
    // for all day events when coming back from FullCalendar
    const expandedEvents = events.map((event) => {
      return {
        ...event,
        entryStart: event.start,
      };
    });

    setEvents(expandedEvents);
  };

  const handleDeleteSeries = () => {
    deleteEntry(displayedEventData._id, displayedEventData.startTimeUtc, true)
      .then(() => {
        getEntries(rangeStart, rangeEnd).then((entries) => {
          setEventsWithStart(entries);
          setShowDeletionSelectionScreen(false);
          setShowOverlay(false);
        });
      })
      .catch((err) => {
        setShowOverlay(false);
        setShowDeletionSelectionScreen(false);
        console.log("Error:", err.message)
        flashApiErrorMessage();
      });
  };

  const handleDeleteRecurringInstance = () => {
    deleteEntry(displayedEventData._id, displayedEventData.startTimeUtc, false)
      .then(() => {
        getEntries(rangeStart, rangeEnd).then((entries) => {
          setEventsWithStart(entries);
          setShowDeletionSelectionScreen(false);
          setShowOverlay(false);
        });
      })
      .catch((err) => {
        setShowOverlay(false);
        setShowDeletionSelectionScreen(false);
        console.log("Error:", err.message)
        flashApiErrorMessage();
      });
  };

  const saveRecurringSeriesChanges = (data) => {
    const entryId = displayedEventData._id;
    updateEntry(
      entryId,
      {
        title: data.title,
        description: data.description,
        startTimeUtc: data.startTimeUtc,
        endTimeUtc: data.endTimeUtc,
        allDay: data.allDay,
        recurring: data.recurring,
        frequency: data.frequency,
        recurrenceEndUtc: data.recurrenceEndUtc,
      },
      displayedEventData.startTimeUtc,
      true,
    )
      .then(() => {
        getEntries(rangeStart, rangeEnd).then((entries) => {
          setEventsWithStart(entries);
        });
        setShowOverlay(false);
        setShowEditSelectionScreen(false);
      })
      .catch((err) => {
        setShowOverlay(false);
        setShowEditSelectionScreen(false);
        console.log("Error:", err.message)
        flashApiErrorMessage();
      });
  }

  const saveRecurringInstanceChanges = (data) => {
    const entryId = displayedEventData._id;
    updateEntry(
      entryId,
      {
        title: data.title,
        description: data.description,
        startTimeUtc: data.startTimeUtc,
        endTimeUtc: data.endTimeUtc,
        allDay: data.allDay,
        recurring: data.recurring,
        frequency: data.frequency,
        recurrenceEndUtc: data.recurrenceEndUtc,
      },
      displayedEventData.startTimeUtc,
      false,
    )
      .then(() => {
        getEntries(rangeStart, rangeEnd).then((entries) => {
          setEventsWithStart(entries);
        });
        setShowOverlay(false);
        setShowEditSelectionScreen(false);
      })
      .catch((err) => {
        setShowOverlay(false);
        setShowEditSelectionScreen(false);
        console.log("Error:", err.message)
        flashApiErrorMessage();
      });
  }

  const handleEditEntry = () => {
    if (displayedEventData.recurring) {
      setShowEditSelectionScreen(true)
    } else {
      setInEditMode(true)
    }
  }

  const handleDeleteEntry = async (e) => {
    e.preventDefault();
    if (displayedEventData.recurring) {
      setShowDeletionSelectionScreen(true);
    } else {
      deleteEntry(displayedEventData._id)
        .then(() => {
          getEntries(rangeStart, rangeEnd).then((entries) => {
            setEventsWithStart(entries);
            setShowOverlay(false);
          });
        })
        .catch((err) => {
          setShowOverlay(false);
          console.log("Error:", err.message)
          flashApiErrorMessage();
        });
    }
  };

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
    recurrenceEnds,
  }) => {
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
      recurrenceEndUtc,
    }).catch((err) => {
      console.log("Error:", err.message)
      flashApiErrorMessage();
    });
    getEntries(rangeStart, rangeEnd)
      .then((entries) => {
        setEventsWithStart(entries);
        setShowOverlay(false);
        setInCreateMode(false);
      })
      .catch((err) => {
        console.log("Error:", err.message)
        flashApiErrorMessage();
      });
  };

  const getEntryDetails = (entryId, start) => {
    getEntry(entryId, start)
      .then((data) => {
        setDisplayedEventData(data);
        setShowOverlay(true);
        setInEditMode(false);
      })
      .catch((err) => {
        setShowOverlay(false);
        console.log("Error:", err.message)
        flashApiErrorMessage();
      });
  };

  const openModal = (arg) => {
    const entryId = arg.event._def.extendedProps._id;
    const start = arg.event._def.extendedProps.entryStart;
    getEntryDetails(entryId, start);
  };

  const setEditingSeriesAndOpenModal = () => {
    setShowEditSelectionScreen(false)
    setEditingSeries(true)
    setInEditMode(true)
  }

  const setEditingSingleAndOpenModal = () => {
    setShowEditSelectionScreen(false)
    setEditingSeries(false)
    setInEditMode(true)
  }

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
    recurrenceEnds,
  }) => {
    const startTimeUtc = new Date(getDateTimeString(startDate, startTime));
    const endTimeUtc = new Date(getDateTimeString(endDate, endTime));
    let recurrenceEndUtc;
    if (recurrenceEnds) {
      recurrenceEndUtc = new Date(getDateTimeString(recurrenceEnds, startTime));
    }

    if (displayedEventData.recurring) {
      const data = {
        title,
        description,
        startTimeUtc,
        endTimeUtc,
        allDay,
        recurring,
        frequency,
        recurrenceEndUtc,
      }

      if (editingSeries) {
        saveRecurringSeriesChanges(data)
      } else {
        saveRecurringInstanceChanges(data)
      }

      setInEditMode(false);
    } else {
      updateEntry(displayedEventData._id, {
        title,
        description,
        startTimeUtc,
        endTimeUtc,
        allDay,
        recurring,
        frequency,
        recurrenceEndUtc,
      })
        .then(() => {
          getEntries(rangeStart, rangeEnd).then((entries) => {
            setEventsWithStart(entries);
          });
          setShowOverlay(false);
          setInEditMode(false);
        })
        .catch((err) => {
          setShowOverlay(false);
          console.log("Error:", err.message)
          flashApiErrorMessage();
        });
    }
  };

  const determineFormMode = () => {
    if (displayedEventData.recurring) {
      return editingSeries ? FORM_MODE.editRecurringSeries : FORM_MODE.editRecurringInstance
    } else {
      return FORM_MODE.full
    }
  }

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
            {!inEditMode &&
              !inCreateMode &&
              !showDeletionSelectionScreen &&
              !showEditSelectionScreen && (
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
            {showDeletionSelectionScreen && (
              <>
                <ModalHeader>{displayedEventData.title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <p>
                    Would you like to delete the entire recurring series or just
                    this event?
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button onClick={handleDeleteSeries} variant="ghost">
                    Delete series
                  </Button>
                  <Button
                    onClick={handleDeleteRecurringInstance}
                    variant="ghost"
                  >
                    Delete this one event
                  </Button>
                </ModalFooter>
              </>
            )}
            {showEditSelectionScreen && (
              <>
                <ModalHeader>{displayedEventData.title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <p>
                    Would you like to edit the entire recurring series or just
                    this event?
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button onClick={setEditingSeriesAndOpenModal} variant="ghost">
                    Edit series
                  </Button>
                  <Button onClick={setEditingSingleAndOpenModal} variant="ghost">
                    Edit this one event
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
                    initialRecurrenceFrequency={displayedEventData.frequency}
                    initialRecurrenceEnd={formatDate(
                      new Date(displayedEventData.recurrenceEndsUtc),
                    )}
                    onFormSubmit={handleSaveChanges}
                    isCreate={false}
                    formMode={determineFormMode()}
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

export default Calendar;
