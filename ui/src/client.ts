interface CalendarEntryInput {
  title: string;
  description: string;
  startTimeUtc: Date;
  endTimeUtc: Date;
  allDay: boolean;
  recurring: boolean;
  frequency?: string;
  recurrenceBegins?: Date;
  recurrenceEndUtc?: Date;
}

const notOk = (status: number) => {
  return !status.toString().match(/2\d+/);
};

const getEntries = async (start: string, end: string) => {
  return fetch(`http://localhost:4000/entries?start=${start}&end=${end}`, {
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

const getEntry = async (entryId: string) => {
  return fetch(`http://localhost:4000/entries/${entryId}`, {
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
  recurrenceBegins,
  recurrenceEndUtc,
}: CalendarEntryInput) => {
  let response;
  if (recurring) {
    response = await fetch("http://localhost:4000/entries", {
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
        recurrenceBegins: recurrenceBegins?.toISOString(),
        recurrenceEndsUtc: recurrenceEndUtc?.toISOString(),
      }),
    });
  } else {
    response = await fetch("http://localhost:4000/entries", {
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
    recurrenceBegins,
    recurrenceEndUtc,
  }: CalendarEntryInput,
) => {
  let response;
  if (recurring) {
    response = await fetch(`http://localhost:4000/entries/${entryId}`, {
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
        recurrenceBegins: recurrenceBegins?.toISOString(),
        recurrenceEnds: recurrenceEndUtc?.toISOString(),
      }),
    });
  } else {
    response = await fetch(`http://localhost:4000/entries/${entryId}`, {
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

const deleteEntry = async (entryId: string) => {
  const response = await fetch(`http://localhost:4000/entries/${entryId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await response;
  if (notOk(response.status)) {
    throw new Error("Delete entry request failed");
  }
  return result;
};

export { getEntry, getEntries, createEntry, deleteEntry, updateEntry };
