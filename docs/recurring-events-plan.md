### Recurring Events Plan

We are using these two articles as our reference point:
https://github.com/bmoeskau/Extensible/blob/master/recurrence-overview.md
https://vertabelo.com/blog/again-and-again-managing-recurring-events-in-a-data-model/

#### Schema

CalendarEntry:
eventId
creatorId
title
description
allDay
startTimeUtc
endTimeUtc
recurrenceEndsUtc
recurring
recurrencePattern

EntryException:
id
deleted: boolean
modified: boolean
entryId
creatorId
title
description
allDay
startTimeUtc
endTimeUtc

#### Create

Frontend will send input to backend: start, end, recurring, recurring end date
Backend will calculate duration and use rrule to generate the rule string which will be stored
Backend will send back 201 created

#### Read of single event

Frontend will request read of event using event ID and date
Backend will generate event using rrule and date (range?)
Backend will return generated event

#### Read of all events

Frontend will request all events for a range of time (i.e. one month)
Backend will generate instances within that time range for every rule, (delete any deleted exceptions, and add in any updated exceptions) and include those events in the payload

#### Update of single event

Frontend will request update for single event
Backend will generate rule exception with all of the event data and store in DB

#### Update of all events

Frontend will request update
Backend will generate new rrule string using data and store on the event object
Backend will return 201

#### Delete of single event

Frontend will request deletion of single event
Backend will generate rule exception and mark it as deleted
Backend will return 200

#### Delete of all events

Frontend will request deletion of series
Backend will delete event and any exceptions
Backend will return 200
