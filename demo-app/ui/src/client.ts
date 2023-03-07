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
      const result = data.map((event: any) => {
        return {
          _id: event._id,
          title: event.title,
          start: event.startTimeUtc,
          end: event.endTimeUtc,
          allDay: event.allDay,
          recurring: event.recurring,
          recurrenceEnd: event.recurrenceEndsUtc,
        };
      });
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
  });
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
  console.log("inside the function")
  let response;
  if (recurring) {
    console.log("about to make the request")
    console.log({startTimeUtc, endTimeUtc, recurrenceEndUtc})
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
          recurrenceEnds: recurrenceEndUtc?.toISOString(),
        }),
      },
    );
    console.log({response})
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
    console.log("hitting not ok block")
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
