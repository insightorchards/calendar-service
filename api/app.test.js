const { connectDB, dropDB, dropCollections } = require("./setupTestDb");
const { CalendarEntry } = require("./models/calendarEntry");
const { RecurringSeries } = require("./models/recurringSeries");
const supertest = require("supertest");
const { app } = require("./app");
const { dayAfter, yearAfter } = require("./lib/dateHelpers");

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await dropCollections();
});

afterAll(async () => {
  await dropDB();
});

describe("POST /seedDatabase", () => {
  it("adds items into the database", async () => {
    const numBefore = await CalendarEntry.countDocuments();
    await supertest(app).post("/seedDatabase").expect(201);
    const numAfter = await CalendarEntry.countDocuments();
    expect(numAfter - numBefore).toEqual(3);
  });
});

describe("POST /entries", () => {
  it("adds an item to the database", async () => {
    const startTime = new Date();
    const endTime = new Date();
    await supertest(app)
      .post("/entries")
      .send({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        startTimeUtc: startTime,
        endTimeUtc: endTime,
        allDay: false,
        recurring: false,
        description: "and a happy night too",
      })
      .expect(201);

    const mostRecentEntry = await CalendarEntry.findOne({}).sort({
      $natural: -1,
    });

    expect(mostRecentEntry).toEqual(
      expect.objectContaining({
        _id: expect.anything(),
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        startTimeUtc: startTime,
        endTimeUtc: endTime,
        allDay: false,
        recurring: false,
        description: "and a happy night too",
      }),
    );
  });

  it("can create recurring events", async () => {
    const startTime = new Date("05 July 2011 14:48 UTC");
    const endTime = new Date("05 July 2011 14:48 UTC");
    const oneYearLater = yearAfter(startTime);

    await supertest(app)
      .post("/entries")
      .send({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        startTimeUtc: startTime,
        endTimeUtc: endTime,
        allDay: false,
        recurring: true,
        frequency: "monthly",
        recurrenceBegins: startTime,
        recurrenceEnds: oneYearLater,
        description: "and a happy night too",
      })
      .expect(201);
    const recurringSeries = await RecurringSeries.findOne();

    const recurringEvents = await CalendarEntry.find({
      recurringEventId: recurringSeries._id,
    });

    expect(new Date(recurringSeries.startTimeUtc)).toEqual(new Date(startTime));
    expect(new Date(recurringSeries.endTimeUtc)).toEqual(new Date(endTime));
    expect(new Date(recurringSeries.recurrenceBegins)).toEqual(
      new Date(startTime),
    );
    expect(new Date(recurringSeries.recurrenceEnds)).toEqual(
      new Date(oneYearLater),
    );
    expect(recurringSeries).toEqual(
      expect.objectContaining({
        _id: expect.anything(),
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        allDay: false,
        recurring: true,
        frequency: "monthly",
        description: "and a happy night too",
      }),
    );

    expect(recurringEvents.length).toEqual(13);
  });

  it("catches and returns an error from CalendarEntry.create", async () => {
    const createMock = jest
      .spyOn(CalendarEntry, "create")
      .mockRejectedValue({ message: "error occurred" });
    const startTime = new Date();
    const endTime = new Date();
    const response = await supertest(app)
      .post(`/entries`)
      .send({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        startTimeUtc: startTime,
        endTimeUtc: endTime,
        recurring: false,
        description: "and a happy night too",
      })
      .expect(400);
    expect(response.text).toEqual('{"message":"error occurred"}');
    createMock.mockRestore();
  });
});

describe("GET /entries", () => {
  beforeEach(() => {
    const today = new Date();

    CalendarEntry.create({
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Birthday party",
      description: "Let's celebrate Janie!",
      allDay: false,
      recurring: false,
      startTimeUtc: today,
      endTimeUtc: dayAfter(today),
    });
    CalendarEntry.create({
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Dog walk",
      description: "Time for Scottie walking",
      allDay: false,
      recurring: false,
      startTimeUtc: today,
      endTimeUtc: dayAfter(today),
    });
  });

  it("returns the entries that exist in the database", async () => {
    const response = await supertest(app).get("/entries").expect(200);
    expect(response.body.length).toEqual(2);
  });

  it("catches and returns an error from CalendarEntry.find", async () => {
    const findMock = jest
      .spyOn(CalendarEntry, "find")
      .mockRejectedValue({ message: "error occurred" });

    const response = await supertest(app).get(`/entries`).expect(400);
    expect(response.text).toEqual('{"message":"error occurred"}');
    findMock.mockRestore();
  });
});

describe("GET /entry/:entryId", () => {
  let newEntry;
  const today = new Date();
  beforeEach(async () => {
    newEntry = await CalendarEntry.create({
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Birthday party",
      description: "Let's celebrate Janie!",
      allDay: false,
      recurring: false,
      startTimeUtc: today,
      endTimeUtc: dayAfter(today),
    });
  });

  it("returns the requested entry", async () => {
    const response = await supertest(app)
      .get(`/entries/${newEntry.id}`)
      .expect(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        eventId: "634b339218b3b892b312e5ca",
        creatorId: "424b339218b3b892b312e5cb",
        title: "Birthday party",
        description: "Let's celebrate Janie!",
        allDay: false,
        recurring: false,
        startTimeUtc: today.toISOString(),
        endTimeUtc: dayAfter(today).toISOString(),
      }),
    );
  });

  it("catches and returns an error from CalendarEntry.findOne", async () => {
    const findOneMock = jest
      .spyOn(CalendarEntry, "findOne")
      .mockRejectedValue({ message: "error occurred" });

    const response = await supertest(app)
      .get(`/entries/${newEntry.id}`)
      .expect(400);
    expect(response.text).toEqual('{"message":"error occurred"}');
    findOneMock.mockRestore();
  });
});

describe("DELETE / entry", () => {
  let data;
  const startTime = new Date("05 July 2011 14:48 UTC");
  const endTime = new Date("05 July 2011 14:48 UTC");
  const oneYearLater = yearAfter(startTime);

  beforeEach(async () => {
    data = await CalendarEntry.create({
      eventId: "123",
      creatorId: "456",
      title: "Happy day",
      description: "and a happy night too",
      allDay: false,
      recurring: false,
      startTimeUtc: startTime,
      endTimeUtc: endTime,
    });
  });

  it("deletes the selected entry from the database", async () => {
    await supertest(app).delete(`/entries/${data._id}`).expect(200);

    const newCount = await CalendarEntry.countDocuments();
    expect(newCount).toEqual(0);
  });

  it("deletes recurring events from the database", async () => {
    const updatedEntryData = await supertest(app)
      .patch(`/entries/${data._id}`)
      .send({
        eventId: "345",
        creatorId: "678",
        title: "Listen to Sweet Surrender",
        startTimeUtc: startTime,
        endTimeUtc: endTime,
        description: "by John Denver",
        recurring: true,
        allDay: false,
        frequency: "monthly",
        recurrenceBegins: startTime,
        recurrenceEnds: oneYearLater,
      })
      .expect(200);

    const updatedEntry = JSON.parse(updatedEntryData.text);
    const recurringSeries = await RecurringSeries.findOne();

    const recurringEvents = await CalendarEntry.find({
      recurringEventId: recurringSeries._id,
    });

    expect(recurringEvents.length).toBe(13);

    await supertest(app).delete(`/entries/${updatedEntry._id}`).expect(200);

    const newCount = await CalendarEntry.countDocuments();
    expect(newCount).toEqual(0);
  });

  it("catches and returns an error from CalendarEntry.deleteOne", async () => {
    const deleteMock = jest
      .spyOn(CalendarEntry, "deleteOne")
      .mockRejectedValue({ message: "error occurred" });

    const response = await supertest(app)
      .delete(`/entries/${data._id}`)
      .expect(400);
    expect(response.text).toEqual('{"message":"error occurred"}');
    deleteMock.mockRestore();
  });
});

describe("PATCH / entry", () => {
  let data;
  const startTime = new Date();
  const endTime = new Date();

  beforeEach(async () => {
    data = await CalendarEntry.create({
      eventId: "123",
      creatorId: "456",
      title: "Happy day",
      description: "and a happy night too",
      allDay: false,
      recurring: false,
      startTimeUtc: startTime,
      endTimeUtc: endTime,
    });
  });

  it("edits the selected entry in the database", async () => {
    const newStart = new Date();
    const newEnd = dayAfter(newStart);
    await supertest(app)
      .patch(`/entries/${data._id}`)
      .send({
        eventId: "345",
        creatorId: "678",
        title: "Listen to Sweet Surrender",
        startTimeUtc: newStart,
        endTimeUtc: newEnd,
        description: "by John Denver",
      })
      .expect(200);

    const editedEntry = await CalendarEntry.findById(data._id);

    expect(editedEntry).toEqual(
      expect.objectContaining({
        _id: expect.anything(),
        eventId: "345",
        creatorId: "678",
        title: "Listen to Sweet Surrender",
        startTimeUtc: newStart,
        endTimeUtc: newEnd,
        description: "by John Denver",
      }),
    );
  });

  it("creates recurring events for edited event as needed", async () => {
    const newStart = new Date("05 July 2011 14:48 UTC");
    const newEnd = dayAfter(newStart);
    const oneYearLater = yearAfter(newStart);
    await supertest(app)
      .patch(`/entries/${data._id}`)
      .send({
        eventId: "345",
        creatorId: "678",
        title: "Listen to Sweet Surrender",
        startTimeUtc: newStart,
        endTimeUtc: newEnd,
        description: "by John Denver",
        recurring: true,
        allDay: false,
        frequency: "monthly",
        recurrenceBegins: newStart,
        recurrenceEnds: oneYearLater,
      })
      .expect(200);

    const recurringSeries = await RecurringSeries.findOne();

    const recurringEvents = await CalendarEntry.find({
      recurringEventId: recurringSeries._id,
    });

    expect(recurringSeries).toEqual(
      expect.objectContaining({
        _id: expect.anything(),
        eventId: "345",
        creatorId: "678",
        title: "Listen to Sweet Surrender",
        startTimeUtc: newStart,
        endTimeUtc: newEnd,
        recurring: true,
        description: "by John Denver",
      }),
    );

    expect(recurringEvents.length).toBe(13);
  });

  it("deletes recurring events for edited event as needed", async () => {
    const newStart = new Date("05 July 2011 14:48 UTC");
    const newEnd = dayAfter(newStart);
    const oneYearLater = yearAfter(newStart);
    const updatedEntryData = await supertest(app)
      .patch(`/entries/${data._id}`)
      .send({
        eventId: "345",
        creatorId: "678",
        title: "Listen to Sweet Surrender",
        startTimeUtc: newStart,
        endTimeUtc: newEnd,
        description: "by John Denver",
        recurring: true,
        allDay: false,
        frequency: "monthly",
        recurrenceBegins: newStart,
        recurrenceEnds: oneYearLater,
      })
      .expect(200);

    const updatedEntry = JSON.parse(updatedEntryData.text);

    const recurringSeries = await RecurringSeries.findOne();

    const recurringEvents = await CalendarEntry.find({
      recurringEventId: recurringSeries._id,
    });

    expect(recurringEvents.length).toBe(13);

    await supertest(app)
      .patch(`/entries/${updatedEntry._id}`)
      .send({
        eventId: "345",
        creatorId: "678",
        title: "Listen to Sweet Surrender",
        startTimeUtc: newStart,
        endTimeUtc: newEnd,
        allDay: false,
        description: "by John Denver",
        recurring: false,
      })
      .expect(200);

    const updatedRecurringEvents = await CalendarEntry.find({
      recurringEventId: recurringSeries._id,
    });

    expect(updatedRecurringEvents.length).toBe(0);
  });

  it("cascades changes to child recurring events when parent is edited", async () => {
    const newStart = new Date("05 July 2011 14:48 UTC");
    const newEnd = dayAfter(newStart);
    const oneYearLater = yearAfter(newStart);
    const recurringEventData = await supertest(app).post("/entries").send({
      eventId: "123",
      creatorId: "456",
      title: "Happy day",
      startTimeUtc: newStart,
      endTimeUtc: newEnd,
      allDay: false,
      recurring: true,
      frequency: "monthly",
      recurrenceBegins: newStart,
      recurrenceEnds: oneYearLater,
      description: "and a happy night too",
    });

    const recurringEvent = JSON.parse(recurringEventData.text);

    const recurringSeries = await RecurringSeries.findOne();

    const recurringEvents = await CalendarEntry.find({
      recurringEventId: recurringSeries._id,
    });

    expect(recurringEvents.length).toBe(13);
    expect(recurringEvents[0].title).toEqual("Happy day");
    const updatedStart = new Date("05 August 2011 14:48 UTC");
    const updatedEnd = dayAfter(updatedStart);
    const updatedOneYearLater = yearAfter(updatedStart);
    await supertest(app).patch(`/entries/${recurringEvent._id}`).send({
      eventId: "123",
      creatorId: "456",
      title: "Listen to Sweet Surrender",
      startTimeUtc: updatedStart,
      endTimeUtc: updatedEnd,
      description: "by John Denver",
      recurring: true,
      frequency: "weekly",
      recurrenceBegins: updatedStart,
      recurrenceEnds: updatedOneYearLater,
    });

    const updatedRecurringSeries = await RecurringSeries.findOne();
    expect(new Date(updatedRecurringSeries.startTimeUtc)).toEqual(
      new Date(updatedStart),
    );
    expect(new Date(updatedRecurringSeries.endTimeUtc)).toEqual(
      new Date(updatedEnd),
    );
    expect(new Date(updatedRecurringSeries.recurrenceBegins)).toEqual(
      new Date(updatedStart),
    );
    expect(new Date(updatedRecurringSeries.recurrenceEnds)).toEqual(
      new Date(updatedOneYearLater),
    );

    expect(updatedRecurringSeries).toEqual(
      expect.objectContaining({
        eventId: "123",
        creatorId: "456",
        title: "Listen to Sweet Surrender",
        description: "by John Denver",
        allDay: false,
        recurring: true,
        frequency: "weekly",
      }),
    );

    const updatedChildEvents = await CalendarEntry.find({
      recurringEventId: updatedRecurringSeries._id,
    });
    const updatedChildEvent = updatedChildEvents[1];
    const updatedChildEventStart = new Date("12 August 2011 14:48 UTC");
    expect(updatedChildEvents.length).toBe(53);

    expect(new Date(updatedChildEvent.startTimeUtc)).toEqual(
      new Date(updatedChildEventStart),
    );
    expect(new Date(updatedChildEvent.endTimeUtc)).toEqual(
      new Date(new Date(dayAfter(updatedChildEventStart))),
    );

    expect(updatedChildEvent.title).toEqual("Listen to Sweet Surrender");
    expect(updatedChildEvent.description).toEqual("by John Denver");
    expect(updatedChildEvent.recurring).toEqual(true);
    expect(`${updatedChildEvent.recurringEventId}`).toEqual(
      `${updatedRecurringSeries._id}`,
    );
    expect(new Date(updatedChildEvent.recurrenceEnds)).toEqual(
      new Date(updatedOneYearLater),
    );
  });

  it("catches and returns an error from CalendarEntry.findByIdAndUpdate", async () => {
    const updateMock = jest
      .spyOn(CalendarEntry, "findByIdAndUpdate")
      .mockRejectedValue({ message: "error occurred" });
    const newStart = new Date();
    const newEnd = dayAfter(newStart);

    const response = await supertest(app)
      .patch(`/entries/${data._id}`)
      .send({
        eventId: "345",
        creatorId: "678",
        title: "Listen to Sweet Surrender",
        startTimeUtc: newStart,
        endTimeUtc: newEnd,
        description: "by John Denver",
      })
      .expect(400);
    expect(response.text).toEqual('{"message":"error occurred"}');
    updateMock.mockRestore();
  });
});
