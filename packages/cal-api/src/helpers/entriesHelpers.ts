import {type EntryExceptionType, RecurringEntry} from "../types"
import { EntryException } from "../models/entryException";
import { addMillisecondsToDate, dateMinusMinutes, datePlusMinutes } from "./dateHelpers";

export const expandModifiedEntryException = async (
  entryException: EntryExceptionType,
  parentCalendarEntry: RecurringEntry,
) => {
  return {
    _id: parentCalendarEntry._id,
    title: entryException.title,
    description: entryException.description,
    allDay: entryException.allDay,
    startTimeUtc: entryException.startTimeUtc,
    endTimeUtc: entryException.endTimeUtc,
    recurring: true,
    eventId: parentCalendarEntry.eventId,
    creatorId: parentCalendarEntry.creatorId,
    frequency: parentCalendarEntry.frequency,
    recurrenceEndsUtc: parentCalendarEntry.recurrenceEndsUtc,
  };
};

export const getExpandedEntryExceptions = async (calendarEntry, start, end) => {
  const modifiedExceptions = await EntryException.find({
    entryId: calendarEntry._id,
    modified: true,
  })
    .where("startTimeUtc")
    .gte(start)
    .where("startTimeUtc")
    .lt(end);

  const promises = modifiedExceptions.map(async (exception) => {
    return expandModifiedEntryException(exception, calendarEntry);
  });

  return await Promise.all(promises);
}

export const addDeletedDatesToRuleSet = async (ruleSet, calendarEntryId) => {
  const deletedExceptions = await EntryException.find({
    entryId: calendarEntryId,
    deleted: true,
  });

  deletedExceptions.forEach((exception) => {
    ruleSet.exdate(exception.startTimeUtc);
  });
}

export const findMatchingModifiedExceptions = async (start, parentCalendarEntry) => {
  const startDate = new Date(start as string);
  const oneMinBefore = dateMinusMinutes(startDate, 1);
  const oneMinAfter = datePlusMinutes(startDate, 1);
  return await EntryException.find({
    entryId: parentCalendarEntry._id,
    modified: true,
  })
    .where("startTimeUtc")
    .gte(oneMinBefore)
    .where("startTimeUtc")
    .lt(oneMinAfter);
};

export const getExpandedRecurringEntries = (ruleSet, calendarEntry, start, end, duration) => {
  const recurrences = ruleSet.between(new Date(start), new Date(end));

  return recurrences.map((date) => {
    return {
      _id: calendarEntry._id,
      eventId: calendarEntry.eventId,
      creatorId: calendarEntry.creatorId,
      title: calendarEntry.title,
      description: calendarEntry.description,
      allDay: calendarEntry.allDay,
      startTimeUtc: date,
      endTimeUtc: addMillisecondsToDate(date, duration),
      recurring: true,
      frequency: calendarEntry.frequency,
      recurrenceEndsUtc: calendarEntry.recurrenceEndsUtc,
    };
  });
}
