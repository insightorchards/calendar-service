const CALENDAR_BACKEND_URL = (process.env.NODE_ENV === 'production') ? process.env.REACT_APP_CALENDAR_BACKEND_URL
: "http://localhost:4000"

export interface CalendarEntryInput {
  title: string;
  description: string;
  startTimeUtc: Date;
  endTimeUtc: Date;
  allDay: boolean;
  recurring: boolean;
  frequency?: string;
  recurrenceEndUtc?: Date;
}

const notOk = (status: number) => {
  return !status.toString().match(/2\d+/);
};

const calculateOffset = (utcDate: string) => {
  const date = new Date(utcDate);
  return date.getTimezoneOffset()
}

const adjustForDaylightSavings = (date: string, offset: number) => {
  const d = new Date(date)
  const utcDate = new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
  )

  const adjustedDate = utcDate.setMinutes(utcDate.getMinutes() - offset)
  return new Date(adjustedDate).toISOString()
}

const buildEventObject = (eventData: any) => {
  const offset = calculateOffset(eventData.seriesStart) || 0
  return {
    _id: eventData._id,
    title: eventData.title,
    unadjustedStart: eventData.startTimeUtc,
    start: adjustForDaylightSavings(eventData.startTimeUtc, offset),
    end: adjustForDaylightSavings(eventData.endTimeUtc, offset),
    allDay: eventData.allDay,
    recurring: eventData.recurring,
    recurrenceEnd: eventData.recurrenceEndsUtc,
  };
}

const getEntries = async (start: string, end: string) => {
  return fetch(`${CALENDAR_BACKEND_URL}/entries?start=${start}&end=${end}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (notOk(response.status)) {
        throw new Error("Get entries request failed");
      }
      return response.json();
    })
    .then((data) => {
      const result = data.map((event: any) => buildEventObject(event))
      return result;
    });
};

const getEntry = async (entryId: string, start?: string) => {
  return fetch(`${CALENDAR_BACKEND_URL}/entries/${entryId}?start=${start}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    if (notOk(response.status)) {
      throw new Error("Get entry request failed");
    }
    return response.json();
  }).then((data) => {
    const offset = calculateOffset(data.seriesStart) || 0
    return {...data,
    startTimeUtc: adjustForDaylightSavings(data.startTimeUtc, offset),
    endTimeUtc: adjustForDaylightSavings(data.endTimeUtc, offset),
    unadjustedStart: data.startTimeUtc,}
  })
};

const createEntry = async ({
  title,
  description,
  startTimeUtc,
  endTimeUtc,
  allDay,
  recurring,
  frequency,
  recurrenceEndUtc,
}: CalendarEntryInput) => {
  let response;
  if (recurring) {
    response = await fetch(`${CALENDAR_BACKEND_URL}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        title,
        creatorId: "1234",
        eventId: "5678",
        startTimeUtc: startTimeUtc.toISOString(),
        endTimeUtc: endTimeUtc.toISOString(),
        allDay,
        recurring,
        frequency,
        recurrenceEndsUtc: recurrenceEndUtc?.toISOString(),
      }),
    });
  } else {
    response = await fetch(`${CALENDAR_BACKEND_URL}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        title,
        creatorId: "1234",
        eventId: "5678",
        startTimeUtc: startTimeUtc.toISOString(),
        endTimeUtc: endTimeUtc.toISOString(),
        allDay,
        recurring,
      }),
    });
  }
  if (notOk(response.status)) {
    throw new Error("Create entry request failed");
  }
  const result = await response.json();
  return result;
};

const updateEntry = async (
  entryId: string,
  {
    title,
    startTimeUtc,
    endTimeUtc,
    description,
    allDay,
    recurring,
    frequency,
    recurrenceEndUtc,
  }: CalendarEntryInput,
  start?: string,
  applyToSeries?: boolean,
) => {
  let response;
  if (recurring) {
    response = await fetch(
      `${CALENDAR_BACKEND_URL}/entries/${entryId}?start=${start}&applyToSeries=${applyToSeries}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description,
          title: title,
          creatorId: "1234",
          eventId: "5678",
          startTimeUtc: startTimeUtc.toISOString(),
          endTimeUtc: endTimeUtc.toISOString(),
          allDay,
          recurring,
          frequency,
          recurrenceEndsUtc: recurrenceEndUtc?.toISOString(),
        }),
      },
    );
  } else {
    response = await fetch(`${CALENDAR_BACKEND_URL}/entries/${entryId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: description,
        title: title,
        creatorId: "1234",
        eventId: "5678",
        startTimeUtc: startTimeUtc.toISOString(),
        endTimeUtc: endTimeUtc.toISOString(),
        allDay,
        recurring,
      }),
    });
  }
  if (notOk(response.status)) {
    throw new Error("Update entry request failed");
  }
  const result = await response.json();
  return result;
};

const deleteEntry = async (
  entryId: string,
  start?: string,
  applyToSeries?: boolean,
) => {
  const response = await fetch(
    `${CALENDAR_BACKEND_URL}/entries/${entryId}?start=${start}&applyToSeries=${applyToSeries}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const result = await response;
  if (notOk(response.status)) {
    throw new Error("Delete entry request failed");
  }
  return result;
};

export { getEntry, getEntries, createEntry, deleteEntry, updateEntry };
