interface CalendarEntryInput {
  title: string;
  description: string;
  startTimeUtc: Date;
  endTimeUtc: Date;
  allDay: boolean;
}

const getEntries = async () => {
  return fetch("http://localhost:4000/entries", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const result = data.map((event: any) => {
        return {
          _id: event._id,
          title: event.title,
          start: event.startTimeUtc,
          end: event.endTimeUtc,
          allDay: event.allDay,
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
  }).then((response) => response.json());
};

const createEntry = async ({
  title,
  description,
  startTimeUtc,
  endTimeUtc,
  allDay,
}: CalendarEntryInput) => {
  const response = await fetch("http://localhost:4000/entries", {
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
    }),
  });
  const result = await response.json();
  return result;
};

const updateEntry = async (
  entryId: string,
  { title, startTimeUtc, endTimeUtc, description, allDay }: CalendarEntryInput,
) => {
  const response = await fetch(`http://localhost:4000/entries/${entryId}`, {
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
    }),
  });
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
  const result = await response.json();
  return result;
};

export { getEntry, getEntries, createEntry, deleteEntry, updateEntry };
