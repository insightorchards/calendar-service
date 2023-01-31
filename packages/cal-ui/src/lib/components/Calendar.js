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
import EventForm from "./EventForm";
import s from "./Calendar.module.css";

const Calendar = ({ events }) => {
  const DEFAULT_START = datePlusHours(new Date(), 1).toISOString();
  const DEFAULT_END = datePlusHours(new Date(), 2).toISOString();

  const [modalStart, setModalStart] = useState(DEFAULT_START);
  const [modalEnd, setModalEnd] = useState(DEFAULT_END);

  const [showOverlay, setShowOverlay] = useState(false);
  const [inCreateMode, setInCreateMode] = useState(false);
  const [inEditMode, setInEditMode] = useState(false);
  const [modalAllDay, setModalAllDay] = useState(false);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  const [displayedEventData, setDisplayedEventData] = useState({});

  const closeOverlay = () => {
    setShowOverlay(false);
    setInEditMode(false);
    setInCreateMode(false);
    // setShowDeletionSelectionScreen(false);
    // setShowEditSelectionScreen(false);
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
    recurrenceBegins,
    recurrenceEnds,
  }) => {
    const startTimeUtc = new Date(getDateTimeString(startDate, startTime));
    const endTimeUtc = new Date(getDateTimeString(endDate, endTime));
    let recurrenceEndUtc;
    if (recurrenceEnds) {
      recurrenceEndUtc = new Date(getDateTimeString(recurrenceEnds, startTime));
    }

    // await createEntry({
    //   title,
    //   description,
    //   startTimeUtc,
    //   endTimeUtc,
    //   allDay,
    //   recurring,
    //   frequency,
    //   recurrenceBegins,
    //   recurrenceEndUtc,
    // }).catch(() => {
    //   flashApiErrorMessage();
    // });
    // getEntries(rangeStart, rangeEnd)
    //   .then((entries) => {
    //     setEventsWithStart(entries);
    //     setShowOverlay(false);
    //     setInCreateMode(false);
    //   })
    //   .catch(() => {
    //     flashApiErrorMessage();
    //   });
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
  }) => {
    const startTimeUtc = new Date(getDateTimeString(startDate, startTime));
    const endTimeUtc = new Date(getDateTimeString(endDate, endTime));
    let recurrenceEndUtc;
    if (recurrenceEnds) {
      recurrenceEndUtc = new Date(getDateTimeString(recurrenceEnds, startTime));
    }

    // if (displayedEventData.recurring) {
    //   setPendingEdits({
    //     title,
    //     description,
    //     startTimeUtc,
    //     endTimeUtc,
    //     allDay,
    //     recurring,
    //     frequency,
    //     recurrenceBegins,
    //     recurrenceEndUtc,
    //   });
    //   setShowEditSelectionScreen(true);
    //   setInEditMode(false);
    // } else {
    //   updateEntry(displayedEventData._id, {
    //     title,
    //     description,
    //     startTimeUtc,
    //     endTimeUtc,
    //     allDay,
    //     recurring,
    //     frequency,
    //     recurrenceBegins,
    //     recurrenceEndUtc,
    //   })
    //     .then(() => {
    //       getEntries(rangeStart, rangeEnd).then((entries) => {
    //         setEventsWithStart(entries);
    //       });
    //       setShowOverlay(false);
    //       setInEditMode(false);
    //     })
    //     .catch(() => {
    //       setShowOverlay(false);
    //       flashApiErrorMessage();
    //     });
    // }
  };

  return (
    <div className="App">
      <ChakraProvider>
        <Box>
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
        </Box>
        <Modal isOpen={showOverlay} onClose={closeOverlay}>
          <ModalOverlay />
          <ModalContent>
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

export default Calendar;
