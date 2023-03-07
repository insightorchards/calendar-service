import { CalendarEntry } from "../models/calendarEntry";
import {type EntryExceptionType, RecurringEntryType} from "../types"
import { EntryException } from "../models/entryException";
import { addMillisecondsToDate, dateMinusMinutes, datePlusMinutes, getMillisecondsBetween, getTimeFromDate, setTimeForDate } from "./dateHelpers";
import { RRule, RRuleSet, rrulestr } from "rrule";
import { FREQUENCY_MAPPING } from "../controllers/calendar";

export const expandModifiedEntryException = async (
  entryException: EntryExceptionType,
  parentCalendarEntry: RecurringEntryType,
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

export const getRecurringEntriesWithinRange = async (start, end) => {
  const recurringEntriesBeginsWithin: RecurringEntryType[] =
  await CalendarEntry.find()
    .where("recurring")
    .equals(true)
    .where("startTimeUtc")
    .gte(start)
    .where("startTimeUtc")
    .lt(end);
  const recurringEntriesBeginsBefore: RecurringEntryType[] =
    await CalendarEntry.find()
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
      end,
    );

    allRecurrences.push(...expandedEntries);
  }
  return allRecurrences
}

export const expandRecurringEntry = async (calendarEntry, start, end) => {
  const duration = getMillisecondsBetween(
    calendarEntry.startTimeUtc,
    calendarEntry.endTimeUtc,
  );
  const rule = rrulestr(calendarEntry.recurrencePattern);
  const rruleSet = new RRuleSet();
  rruleSet.rrule(rule);

  await addDeletedDatesToRuleSet(rruleSet, calendarEntry._id)

  const expandedRecurringEntries = getExpandedRecurringEntries(rruleSet, calendarEntry, start, end, duration)
  const expandedExceptionEntries = await getExpandedEntryExceptions(calendarEntry, start, end)

  return expandedRecurringEntries.concat(expandedExceptionEntries);
};

export const handleRecurringEntryDeletion = async (entryToDelete, start) => {
  const existingModifiedExceptions = await findMatchingModifiedExceptions(
    start,
    entryToDelete,
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
}

export const updateExceptionDetails = (exception, data) => {
  exception.title = data.title;
  exception.description = data.description;
  exception.title = data.title;
  exception.allDay = data.allDay;
  exception.startTimeUtc = data.startTimeUtc;
  exception.endTimeUtc = data.endTimeUtc;
  exception.save();
  return exception  
}

export const updateRecurrenceRule = async (entry) => {
  const rule = new RRule({
    freq: FREQUENCY_MAPPING[entry.frequency],
    dtstart: entry.startTimeUtc,
    until: entry.recurrenceEndsUtc,
  });
  entry.recurrencePattern = rule.toString();
  await entry.save();
}

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
    startTimeUtc: data.startTimeUtc,
    title: data.title,
    description: data.description,
    allDay: data.allDay,
    endTimeUtc: data.endTimeUtc,
  });
}

export const updateRelevantFieldsOnSeries = async (entry, data) => {
  const {
    updatedStartUtc,
    updatedEndUtc
  } = calculateNewStartAndEnd(entry, data.startTimeUtc, data.endTimeUtc)

  // The following are the only fields that are allowed to be edited on a recurring series
  entry.startTimeUtc = updatedStartUtc
  entry.endTimeUtc = updatedEndUtc
  entry.title = data.title
  entry.description = data.description
  entry.recurrenceEndsUtc = data.recurrenceEndsUtc
  entry.frequency = data.frequency
  entry.allDay = data.allDay
  await entry.save()
  await updateRecurrenceRule(entry)
  return entry
}

const calculateNewStartAndEnd = (originalEntry, newStart, newEnd) => {
  const {hours: newStartHours, minutes: newStartMinutes} = getTimeFromDate(newStart)
  const {hours: newEndHours, minutes: newEndMinutes} = getTimeFromDate(newEnd)

  const updatedStartUtc = setTimeForDate(originalEntry.startTimeUtc, newStartHours, newStartMinutes)
  const updatedEndUtc = setTimeForDate(originalEntry.endTimeUtc, newEndHours, newEndMinutes)

  return {
    updatedStartUtc,
    updatedEndUtc
  }
}

export const updateEntryExceptionsForEntry = async (entry) => {
  const modifiedEntryExceptions = await EntryException.find({
    entryId: entry._id,
    modified: true,
  })

  const {hours: newStartHours, minutes: newStartMinutes} = getTimeFromDate(entry.startTimeUtc)
  const {hours: newEndHours, minutes: newEndMinutes} = getTimeFromDate(entry.endTimeUtc)

  for (const exception of modifiedEntryExceptions) {
    exception.title = entry.title
    exception.description = entry.description
    exception.allDay = entry.allDay
    exception.startTimeUtc = setTimeForDate(exception.startTimeUtc, newStartHours, newStartMinutes)
    exception.endTimeUtc = setTimeForDate(exception.endTimeUtc, newEndHours, newEndMinutes)
    await exception.save()
  }

  const deletedEntryExceptions = await EntryException.find({
    entryId: entry._id,
    deleted: true,
  })

  for (const exception of deletedEntryExceptions) {
    exception.startTimeUtc = setTimeForDate(exception.startTimeUtc, newStartHours, newStartMinutes)
    await exception.save()
  }
}
