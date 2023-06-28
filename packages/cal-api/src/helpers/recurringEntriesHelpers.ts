import { defaultTo } from "ramda";
import { RRule, RRuleSet, rrulestr } from "rrule";
import { FREQUENCY_MAPPING } from "../controllers/calendarEntries_old";
import { CalendarEntry } from "../models/calendarEntryOld";
import { EntryException } from "../models/entryException";
import { RecurringEntryType, type EntryExceptionType } from "../types";
import {
  addMillisecondsToDate,
  dateMinusMinutes,
  datePlusMinutes,
  getMillisecondsBetween,
  getTimeFromDate,
  setTimeForDate,
} from "./dateHelpers";

export const expandModifiedEntryException = (
  entryException: EntryExceptionType,
  parentCalendarEntry: RecurringEntryType
) => {
  return {
    id: parentCalendarEntry._id,
    _id: parentCalendarEntry._id,
    title: entryException.title,
    description: entryException.description,
    allDay: entryException.allDay,
    startTimeUtc: entryException.startTimeUtc,
    endTimeUtc: entryException.endTimeUtc,
    recurring: true,
    seriesStart: parentCalendarEntry.startTimeUtc,
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

  return modifiedExceptions.map(exception => {
    return expandModifiedEntryException(exception, calendarEntry);
  });
};

export const addDeletedDatesToRuleSet = async (ruleSet, calendarEntryId) => {
  const deletedExceptions = await EntryException.find({
    entryId: calendarEntryId,
    deleted: true,
  });

  deletedExceptions.forEach(exception => {
    ruleSet.exdate(exception.startTimeUtc);
  });
};

export const findMatchingModifiedExceptions = async (
  start,
  parentCalendarEntry
) => {
  const startDate = new Date(start as string);
  const oneMinBefore = dateMinusMinutes(startDate, 1);
  const oneMinAfter = datePlusMinutes(startDate, 1);
  return await EntryException.find({
    entryId: parentCalendarEntry._id,
    modified: true,
    startTimeUtc: { $gte: oneMinBefore, $lt: oneMinAfter },
  });
};

export const getExpandedRecurringEntries = (
  ruleSet,
  calendarEntry,
  start,
  end,
  duration
) => {
  const recurrences = ruleSet.between(new Date(start), new Date(end));

  return recurrences.map(date => {
    return {
      // ⚠️ TODO: build CalendarEntry document via model so that
      // we can leverage the built in schema validations
      id: calendarEntry._id,
      _id: calendarEntry._id,
      eventId: calendarEntry.eventId,
      creatorId: calendarEntry.creatorId,
      title: calendarEntry.title,
      description: calendarEntry.description,
      allDay: calendarEntry.allDay,
      seriesStart: calendarEntry.startTimeUtc,
      startTimeUtc: date,
      endTimeUtc: addMillisecondsToDate(date, duration),
      recurring: true,
      frequency: calendarEntry.frequency,
      recurrenceEndsUtc: calendarEntry.recurrenceEndsUtc,
    };
  });
};

export const getRecurringEntriesWithinRange = async (start, end) => {
  const recurringEntriesBeginsWithin = await CalendarEntry.find()
    .where("recurring")
    .equals(true)
    .where("startTimeUtc")
    .gte(start)
    .where("startTimeUtc")
    .lt(end);

  const recurringEntriesBeginsBefore = await CalendarEntry.find()
    .where("recurring")
    .equals(true)
    .where("startTimeUtc")
    .lt(start)
    .where("recurrenceEndsUtc")
    .gt(start);

  const allRecurringEntries = [
    ...recurringEntriesBeginsWithin,
    ...recurringEntriesBeginsBefore,
  ];
  let allRecurrences = [];

  for (const recurringEntry of allRecurringEntries) {
    const expandedEntries = await expandRecurringEntry(
      recurringEntry,
      start,
      end
    );

    allRecurrences.push(...expandedEntries);
  }
  return allRecurrences;
};

export const expandRecurringEntry = async (calendarEntry, start, end) => {
  const duration = getMillisecondsBetween(
    calendarEntry.startTimeUtc,
    calendarEntry.endTimeUtc
  );
  const rule = rrulestr(calendarEntry.recurrencePattern);
  const rruleSet = new RRuleSet();
  rruleSet.rrule(rule);

  await addDeletedDatesToRuleSet(rruleSet, calendarEntry._id);

  const expandedRecurringEntries = getExpandedRecurringEntries(
    rruleSet,
    calendarEntry,
    start,
    end,
    duration
  );

  const expandedExceptionEntries = await getExpandedEntryExceptions(
    calendarEntry,
    start,
    end
  );

  return expandedRecurringEntries.concat(expandedExceptionEntries);
};

export const handleRecurringEntryDeletion = async (entryToDelete, start) => {
  const existingModifiedExceptions = await findMatchingModifiedExceptions(
    start,
    entryToDelete
  );
  if (existingModifiedExceptions.length > 0) {
    existingModifiedExceptions[0].remove();
  } else {
    await EntryException.create({
      deleted: true,
      modified: false,
      entryId: entryToDelete._id,
      startTimeUtc: start,
    });
  }
};

export const updateExceptionDetails = (exception, data) => {
  exception.title = data.title;
  exception.description = data.description;
  exception.title = data.title;
  exception.allDay = data.allDay;
  exception.startTimeUtc = data.startTimeUtc;
  exception.endTimeUtc = data.endTimeUtc;
  exception.save();
  return exception;
};

export const updateRecurrenceRule = async entry => {
  const rule = new RRule({
    freq: FREQUENCY_MAPPING[entry.frequency],
    dtstart: entry.startTimeUtc,
    until: entry.recurrenceEndsUtc,
  });
  entry.recurrencePattern = rule.toString();
  await entry.save();
};

export const createEntryException = async (entry, data) => {
  await EntryException.create({
    deleted: true,
    modified: false,
    entryId: entry._id,
    startTimeUtc: data.start,
  });

  return await EntryException.create({
    deleted: false,
    modified: true,
    entryId: entry._id,
    startTimeUtc: defaultTo(entry.startTimeUtc, data.startTimeUtc),
    title: defaultTo(entry.title, data.title),
    description: defaultTo(entry.description, data.description),
    allDay: defaultTo(entry.allDay, data.allDay),
    endTimeUtc: defaultTo(entry.endTimeUtc, data.endTimeUtc),
  });
};

export const updateEntryExceptionsForEntry = async entry => {
  const modifiedEntryExceptions = await EntryException.find({
    entryId: entry._id,
    modified: true,
  });

  const { hours: newStartHours, minutes: newStartMinutes } = getTimeFromDate(
    entry.startTimeUtc
  );
  const { hours: newEndHours, minutes: newEndMinutes } = getTimeFromDate(
    entry.endTimeUtc
  );

  for (const exception of modifiedEntryExceptions) {
    exception.title = entry.title;
    exception.description = entry.description;
    exception.allDay = entry.allDay;
    exception.startTimeUtc = setTimeForDate(
      exception.startTimeUtc,
      newStartHours,
      newStartMinutes
    );
    exception.endTimeUtc = setTimeForDate(
      exception.endTimeUtc,
      newEndHours,
      newEndMinutes
    );
    await exception.save();
  }

  const deletedEntryExceptions = await EntryException.find({
    entryId: entry._id,
    deleted: true,
  });

  for (const exception of deletedEntryExceptions) {
    exception.startTimeUtc = setTimeForDate(
      exception.startTimeUtc,
      newStartHours,
      newStartMinutes
    );
    await exception.save();
  }
};
