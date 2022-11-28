interface CalendarEntryInput {
  title: string;
  startTimeUtc: Date;
  endTimeUtc: Date;
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
  startTimeUtc,
  endTimeUtc,
}: CalendarEntryInput) => {
  const response = await fetch("http://localhost:4000/entries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description: "default entry description",
      title: title,
      creatorId: "1234",
      eventId: "5678",
      startTimeUtc: startTimeUtc.toISOString(),
      endTimeUtc: endTimeUtc.toISOString(),
    }),
  });
  const result = await response.json();
  return result;
};

const updateEntry = async (
  entryId: string,
  { title, startTimeUtc, endTimeUtc }: CalendarEntryInput
) => {
  const response = await fetch(`http://localhost:4000/entries/${entryId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description: "default entry description",
      title: title,
      creatorId: "1234",
      eventId: "5678",
      startTimeUtc: startTimeUtc.toISOString(),
      endTimeUtc: endTimeUtc.toISOString(),
    }),
  });
  const result = await response.json();
  return result;
};

const deleteEntry = async (entryId: string) => {
  return fetch(`http://localhost:4000/entries/${entryId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((error) => console.log(error));
};

export { getEntry, getEntries, createEntry, deleteEntry, updateEntry };
