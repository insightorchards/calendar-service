const { connectDB, dropDB, dropCollections } = require("./setupTestDb");
const { CalendarEntry } = require("./models/calendarEntryOld");
const supertest = require("supertest");
const { app } = require("./setupTestApp");
const { dayAfter, yearAfter } = require("./helpers/dateHelpers");
const { RRule } = require("rrule");
const { EntryException } = require("./models/entryException");

let server: any;

beforeAll(async () => {
  await connectDB();
  server = app.listen(4001);
});

afterEach(async () => {
  await dropCollections();
});

afterAll(async () => {
  await dropDB();
  await server.close();
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
      })
    );
  });

  it("can create a recurring event", async () => {
    const startTime = new Date("05 July 2011 14:48 UTC");
    const endTime = new Date("06 July 2011 14:48 UTC");
    const oneYearLater = yearAfter(startTime);

    await supertest(app)
      .post("/entries")
      .send({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        description: "and a happy night too",
        startTimeUtc: startTime,
        endTimeUtc: endTime,
        allDay: false,
        recurring: true,
        frequency: "monthly",
        recurrenceEndsUtc: oneYearLater,
      })
      .expect(201);

    const mostRecentEntry = await CalendarEntry.findOne({}).sort({
      $natural: -1,
    });
    const rule = new RRule({
      freq: RRule.MONTHLY,
      dtstart: startTime,
      until: oneYearLater,
    });

    expect(mostRecentEntry).toEqual(
      expect.objectContaining({
        _id: expect.anything(),
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        description: "and a happy night too",
        startTimeUtc: startTime,
        endTimeUtc: endTime,
        allDay: false,
        recurring: true,
        frequency: "monthly",
        recurrenceEndsUtc: oneYearLater,
        recurrencePattern: rule.toString(),
      })
    );
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

describe("GET /entries?start=<start-time>&end=<end-time>", () => {
  const date = new Date("04 January 2023 14:48 UTC");

  beforeEach(async () => {
    const excludedDate = new Date("09 March 2023 14:48 UTC");

    await CalendarEntry.create({
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Birthday party",
      description: "Let's celebrate Janie!",
      allDay: false,
      recurring: false,
      startTimeUtc: date,
      endTimeUtc: dayAfter(date),
    });
    await CalendarEntry.create({
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Dog walk",
      description: "Time for Scottie walking",
      allDay: false,
      recurring: false,
      startTimeUtc: date,
      endTimeUtc: dayAfter(date),
    });
    await CalendarEntry.create({
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Cat stroll",
      description: "Look! A cat!",
      allDay: false,
      recurring: false,
      startTimeUtc: excludedDate,
      endTimeUtc: dayAfter(excludedDate),
    });
  });

  it("returns the entries that are within that time range", async () => {
    const response = await supertest(app)
      .get(
        "/entries?start=2023-01-01T08:00:00.000Z&end=2023-02-12T08:00:00.000Z"
      )
      .expect(200);
    expect(response.body.length).toEqual(2);
  });

  it("includes recurring entries that are within that time range", async () => {
    await supertest(app)
      .post("/entries")
      .send({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        description: "and a happy night too",
        startTimeUtc: date,
        endTimeUtc: dayAfter(date),
        allDay: false,
        recurring: true,
        frequency: "weekly",
        recurrenceEndsUtc: yearAfter(date),
      })
      .expect(201);

    const response = await supertest(app)
      .get(
        "/entries?start=2023-01-01T08:00:00.000Z&end=2023-02-12T08:00:00.000Z"
      )
      .expect(200);
    expect(response.body.length).toEqual(8);
  });

  it("catches and returns an error from CalendarEntry.find", async () => {
    const findMock = jest
      .spyOn(CalendarEntry, "find")
      .mockImplementation(() => {
        throw new Error("error occurred");
      });

    const response = await supertest(app)
      .get(
        `/entries?start=2023-01-01T08:00:00.000Z&end=2023-02-12T08:00:00.000Z`
      )
      .expect(400);

    expect(response.text).toEqual('{"message":"error occurred"}');
    findMock.mockRestore();
  });
});

describe("GET /entries/:id?start=<start-time>", () => {
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
      })
    );
  });

  it("returns the requested recurring entry", async () => {
    const { janFourth, oneYearLater, febFourth } = generateRecurrenceData();

    const createdEventData = await supertest(app)
      .post("/entries")
      .send({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        description: "and a happy night too",
        startTimeUtc: janFourth,
        endTimeUtc: dayAfter(janFourth),
        allDay: false,
        recurring: true,
        frequency: "monthly",
        recurrenceEndsUtc: oneYearLater,
      })
      .expect(201);
    const createdEvent = JSON.parse(createdEventData.text);

    const response = await supertest(app)
      .get(`/entries/${createdEvent._id}?start=${febFourth}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        description: "and a happy night too",
        allDay: false,
        recurring: true,
        seriesStart: janFourth.toISOString(),
        startTimeUtc: febFourth.toISOString(),
        endTimeUtc: dayAfter(febFourth).toISOString(),
      })
    );
  });

  it("returns the transformed entry exception", async () => {
    const { janFourth, oneYearLater, febFourth, febFifth, updatedEndDate } =
      generateRecurrenceData();

    const createdEventData = await supertest(app)
      .post("/entries")
      .send({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        description: "and a happy night too",
        startTimeUtc: janFourth,
        endTimeUtc: dayAfter(janFourth),
        allDay: false,
        recurring: true,
        frequency: "monthly",
        recurrenceEndsUtc: oneYearLater,
      })
      .expect(201);
    const createdEvent = JSON.parse(createdEventData.text);

    await supertest(app)
      .patch(
        `/entries/${
          createdEvent._id
        }?start=${febFourth.toISOString()}&applyToSeries=false`
      )
      .send({
        title: "Listen to Sweet Surrender",
        startTimeUtc: febFifth,
        endTimeUtc: updatedEndDate,
        description: "by John Denver",
        allDay: false,
      })
      .expect(200);

    const response = await supertest(app)
      .get(`/entries/${createdEvent._id}?start=${febFifth}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        eventId: "123",
        creatorId: "456",
        title: "Listen to Sweet Surrender",
        description: "by John Denver",
        allDay: false,
        recurring: true,
        seriesStart: janFourth.toISOString(),
        startTimeUtc: febFifth.toISOString(),
        endTimeUtc: dayAfter(febFifth).toISOString(),
      })
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

  it("returns a not found error when entry does not exist", async () => {
    await supertest(app).delete(`/entries/${newEntry.id}`).expect(200);

    const response = await supertest(app)
      .get(`/entries/${newEntry.id}`)
      .expect(404);
    const responseMessage = JSON.parse(response.text).message;
    expect(responseMessage).toEqual(
      `no calendar entry found with id ${newEntry.id}`
    );
  });
});

describe("DELETE / entry?start=<start-time>&applyToSeries=<boolean>", () => {
  let data;
  const startTime = new Date("05 July 2011 14:48 UTC");
  const endTime = new Date("05 July 2011 14:48 UTC");
  const oneYearLater = yearAfter(startTime);

  it("deletes the selected entry from the database", async () => {
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
    await supertest(app).delete(`/entries/${data._id}`).expect(200);

    const newCount = await CalendarEntry.countDocuments();
    expect(newCount).toEqual(0);
  });

  it("deletes a single instance of a recurring event", async () => {
    const { janFourth, oneYearLater, febFourth } = generateRecurrenceData();

    const createdEventData = await supertest(app)
      .post("/entries")
      .send({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        description: "and a happy night too",
        startTimeUtc: janFourth,
        endTimeUtc: dayAfter(janFourth),
        allDay: false,
        recurring: true,
        frequency: "monthly",
        recurrenceEndsUtc: oneYearLater,
      })
      .expect(201);
    const createdEvent = JSON.parse(createdEventData.text);

    const exceptionCount = await EntryException.countDocuments();
    expect(exceptionCount).toEqual(0);

    const response = await supertest(app)
      .get(`/entries?start=${janFourth}&end=${oneYearLater}`)
      .expect(200);
    expect(response.body.length).toEqual(11);

    await supertest(app)
      .delete(
        `/entries/${
          createdEvent._id
        }?start=${febFourth.toISOString()}&applyToSeries=false`
      )
      .expect(200);

    const updatedExceptionCount = await EntryException.countDocuments();
    expect(updatedExceptionCount).toEqual(1);

    const updatedResponse = await supertest(app)
      .get(`/entries?start=${janFourth}&end=${oneYearLater}`)
      .expect(200);
    expect(updatedResponse.body.length).toEqual(10);
  });

  it("deletes an entry exception from a recurring series", async () => {
    const { janFourth, oneYearLater, febFourth, febFifth, updatedEndDate } =
      generateRecurrenceData();

    const createdEventData = await supertest(app)
      .post("/entries")
      .send({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        description: "and a happy night too",
        startTimeUtc: janFourth,
        endTimeUtc: dayAfter(janFourth),
        allDay: false,
        recurring: true,
        frequency: "monthly",
        recurrenceEndsUtc: oneYearLater,
      })
      .expect(201);
    const createdEvent = JSON.parse(createdEventData.text);

    await supertest(app)
      .patch(
        `/entries/${
          createdEvent._id
        }?start=${febFourth.toISOString()}&applyToSeries=false`
      )
      .send({
        title: "Listen to Sweet Surrender",
        startTimeUtc: febFifth,
        endTimeUtc: updatedEndDate,
        description: "by John Denver",
        allDay: false,
      })
      .expect(200);

    const exceptionCount = await EntryException.where("modified")
      .equals(true)
      .countDocuments();
    expect(exceptionCount).toEqual(1);

    await supertest(app)
      .delete(
        `/entries/${
          createdEvent._id
        }?start=${febFifth.toISOString()}&applyToSeries=false`
      )
      .expect(200);
    const updatedExceptionCount = await EntryException.where("modified")
      .equals(true)
      .countDocuments();
    expect(updatedExceptionCount).toEqual(0);
  });

  it("cascades deletion to entry exceptions when recurring series is deleted", async () => {
    const { janFourth, oneYearLater, febFourth } = generateRecurrenceData();

    const createdEventData = await supertest(app)
      .post("/entries")
      .send({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        description: "and a happy night too",
        startTimeUtc: janFourth,
        endTimeUtc: dayAfter(janFourth),
        allDay: false,
        recurring: true,
        frequency: "monthly",
        recurrenceEndsUtc: oneYearLater,
      })
      .expect(201);
    const createdEvent = JSON.parse(createdEventData.text);

    await supertest(app)
      .delete(
        `/entries/${
          createdEvent._id
        }?start=${febFourth.toISOString()}&applyToSeries=false`
      )
      .expect(200);

    const exceptionCount = await EntryException.countDocuments();
    expect(exceptionCount).toEqual(1);

    await supertest(app)
      .delete(
        `/entries/${
          createdEvent._id
        }?start=${febFourth.toISOString()}&applyToSeries=true`
      )
      .expect(200);

    const updatedExceptionCount = await EntryException.countDocuments();
    expect(updatedExceptionCount).toEqual(0);
  });

  it("catches and returns an error from CalendarEntry.deleteCalendarEntry", async () => {
    const data = await CalendarEntry.create({
      eventId: "123",
      creatorId: "456",
      title: "Happy day",
      description: "and a happy night too",
      allDay: false,
      recurring: false,
      startTimeUtc: startTime,
      endTimeUtc: endTime,
    });
    const findMock = jest
      .spyOn(CalendarEntry, "findById")
      .mockRejectedValue({ message: "error occurred" });

    const response = await supertest(app)
      .delete(`/entries/${data._id}`)
      .expect(400);
    expect(response.text).toEqual('{"message":"error occurred"}');
    findMock.mockRestore();
  });
});

describe("PATCH / entry?start=<start-time>&applyToSeries=<boolean>", () => {
  let data;
  const startTime = new Date();
  const endTime = new Date();

  it("edits the selected entry in the database", async () => {
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
      })
    );
  });

  it("edits an entry from non recurring to a recurring event", async () => {
    const data = await CalendarEntry.create({
      eventId: "123",
      creatorId: "456",
      title: "Evening strolling",
      description: "ways to start a happy evening",
      allDay: false,
      recurring: false,
      startTimeUtc: "2023-06-01T18:30:00.000Z",
      endTimeUtc: "2023-06-01T19:30:00.000Z",
    });

    expect(data).not.toHaveProperty("recurrencepattern");

    await supertest(app)
      .patch(`/entries/${data._id}`)
      .send({
        recurring: true,
        recurrenceEndTime: "2023-07-01T00:00:00.000Z",
        frequency: "weekly",
      })
      .expect(200);

    const editedEntry = await CalendarEntry.findById(data._id);
    expect(editedEntry).toHaveProperty("recurrencePattern");

    const response = await supertest(app)
      .get(
        "/entries?start=2023-06-01T00:00:00.000Z&end=2023-07-01T00:00:00.000Z"
      )
      .expect(200);
    expect(response.body.length).toEqual(5);
  });

  it("can edit a single instance of a recurring event", async () => {
    const { janFourth, oneYearLater, febFourth, febFifth, updatedEndDate } =
      generateRecurrenceData();

    const createdEventData = await supertest(app)
      .post("/entries")
      .send({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        description: "and a happy night too",
        startTimeUtc: janFourth,
        endTimeUtc: dayAfter(janFourth),
        allDay: false,
        recurring: true,
        frequency: "monthly",
        recurrenceEndsUtc: oneYearLater,
      })
      .expect(201);
    const createdEvent = JSON.parse(createdEventData.text);

    const exceptionCount = await EntryException.countDocuments();
    expect(exceptionCount).toEqual(0);

    await supertest(app)
      .patch(
        `/entries/${
          createdEvent._id
        }?start=${febFourth.toISOString()}&applyToSeries=false`
      )
      .send({
        eventId: "345",
        creatorId: "678",
        title: "Listen to Sweet Surrender",
        startTimeUtc: febFifth,
        endTimeUtc: updatedEndDate,
        description: "by John Denver",
      })
      .expect(200);

    const updatedExceptionCount = await EntryException.countDocuments();
    expect(updatedExceptionCount).toEqual(2);

    const entryException = await EntryException.find()
      .sort({ _id: -1 })
      .limit(1);

    const modifiedEntryException = entryException[0];
    expect(modifiedEntryException.entryId.toString()).toEqual(
      createdEvent._id.toString()
    );
    expect(modifiedEntryException.title).toEqual("Listen to Sweet Surrender");
    expect(modifiedEntryException.description).toEqual("by John Denver");
    expect(modifiedEntryException.startTimeUtc).toEqual(febFifth);
    expect(modifiedEntryException.endTimeUtc).toEqual(updatedEndDate);
  });

  it("can edit an entry exception of a recurring event", async () => {
    const { janFourth, oneYearLater, febFourth, febFifth, updatedEndDate } =
      generateRecurrenceData();

    const createdEventData = await supertest(app)
      .post("/entries")
      .send({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        description: "and a happy night too",
        startTimeUtc: janFourth,
        endTimeUtc: dayAfter(janFourth),
        allDay: false,
        recurring: true,
        frequency: "monthly",
        recurrenceEndsUtc: oneYearLater,
      })
      .expect(201);
    const createdEvent = JSON.parse(createdEventData.text);

    await supertest(app)
      .patch(
        `/entries/${
          createdEvent._id
        }?start=${febFourth.toISOString()}&applyToSeries=false`
      )
      .send({
        title: "Listen to Sweet Surrender",
        startTimeUtc: febFifth,
        endTimeUtc: updatedEndDate,
        description: "by John Denver",
        allDay: false,
      })
      .expect(200);

    const newStartDate = new Date("06 February 2023 14:48 UTC");
    const newEndDate = dayAfter(newStartDate);

    const initialModifiedExceptions = await EntryException.where(
      "modified"
    ).equals(true);

    expect(initialModifiedExceptions.length).toEqual(1);
    expect(initialModifiedExceptions[0]).toEqual(
      expect.objectContaining({
        title: "Listen to Sweet Surrender",
        startTimeUtc: febFifth,
        endTimeUtc: updatedEndDate,
        description: "by John Denver",
        allDay: false,
      })
    );

    await supertest(app)
      .patch(
        `/entries/${
          createdEvent._id
        }?start=${febFifth.toISOString()}&applyToSeries=false`
      )
      .send({
        title: "Listen to Country Roads",
        startTimeUtc: newStartDate,
        endTimeUtc: newEndDate,
        description: "by the man John Denver",
        allDay: false,
      })
      .expect(200);

    const modifiedExceptions = await EntryException.where("modified").equals(
      true
    );
    expect(modifiedExceptions.length).toEqual(1);
    expect(modifiedExceptions[0]).toEqual(
      expect.objectContaining({
        title: "Listen to Country Roads",
        startTimeUtc: newStartDate,
        endTimeUtc: newEndDate,
        description: "by the man John Denver",
        allDay: false,
      })
    );
  });

  it("can edit a recurring series from a recurring entry", async () => {
    const { janFourth, oneYearLater, febFourth } = generateRecurrenceData();

    const createdEventData = await supertest(app)
      .post("/entries")
      .send({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        description: "and a happy night too",
        startTimeUtc: janFourth,
        endTimeUtc: dayAfter(janFourth),
        allDay: false,
        recurring: true,
        frequency: "monthly",
        recurrenceEndsUtc: oneYearLater,
      })
      .expect(201);
    const createdEvent = JSON.parse(createdEventData.text);

    const janFourth1600 = new Date("04 January 2023 16:00 UTC");
    const febFourth1600 = new Date("04 February 2023 16:00 UTC");
    const newRecurrenceEnds = yearAfter(new Date("04 March 2023 16:00 UTC"));

    await supertest(app)
      .patch(
        `/entries/${
          createdEvent._id
        }?start=${febFourth.toISOString()}&applyToSeries=true`
      )
      .send({
        title: "Listen to Country Roads",
        description: "by John Denver",
        startTimeUtc: febFourth1600,
        endTimeUtc: dayAfter(febFourth1600),
        frequency: "monthly",
        allDay: false,
        recurring: true,
        recurrenceEndsUtc: newRecurrenceEnds,
      })
      .expect(200);

    const parentRecurringEntry = await CalendarEntry.findById(createdEvent._id);

    const updatedRule = new RRule({
      freq: RRule.MONTHLY,
      dtstart: febFourth1600,
      until: newRecurrenceEnds,
    });

    expect(parentRecurringEntry).toEqual(
      expect.objectContaining({
        title: "Listen to Country Roads",
        description: "by John Denver",
        startTimeUtc: febFourth1600,
        endTimeUtc: dayAfter(febFourth1600),
        recurrenceEndsUtc: newRecurrenceEnds,
        recurrencePattern: updatedRule.toString(),
      })
    );
  });

  it("editing a series updates entry exceptions", async () => {
    const { janFourth, oneYearLater, febFourth, febFifth, updatedEndDate } =
      generateRecurrenceData();

    const createdEventData = await supertest(app)
      .post("/entries")
      .send({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        description: "and a happy night too",
        startTimeUtc: janFourth,
        endTimeUtc: dayAfter(janFourth),
        allDay: false,
        recurring: true,
        frequency: "monthly",
        recurrenceEndsUtc: oneYearLater,
      })
      .expect(201);
    const createdEvent = JSON.parse(createdEventData.text);

    await supertest(app)
      .patch(
        `/entries/${
          createdEvent._id
        }?start=${febFourth.toISOString()}&applyToSeries=false`
      )
      .send({
        title: "Listen to Sweet Surrender",
        startTimeUtc: febFifth,
        endTimeUtc: updatedEndDate,
        description: "by John Denver",
        allDay: false,
      })
      .expect(200);

    const initialModifiedExceptions = await EntryException.where(
      "modified"
    ).equals(true);

    expect(initialModifiedExceptions.length).toEqual(1);
    expect(initialModifiedExceptions[0]).toEqual(
      expect.objectContaining({
        title: "Listen to Sweet Surrender",
        startTimeUtc: febFifth,
        endTimeUtc: updatedEndDate,
        description: "by John Denver",
        allDay: false,
      })
    );

    const janFourth1600 = new Date("04 January 2023 16:00 UTC");

    await supertest(app)
      .patch(
        `/entries/${
          createdEvent._id
        }?start=${janFourth.toISOString()}&applyToSeries=true`
      )
      .send({
        title: "Listen to Country Roads",
        startTimeUtc: janFourth1600,
        endTimeUtc: dayAfter(janFourth1600),
        description: "by J. Denver",
        allDay: false,
        frequency: "monthly",
        recurrenceEndsUtc: oneYearLater,
      })
      .expect(200);

    const febFourth1600 = new Date("04 February 2023 16:00 UTC");
    const febFifth1600 = new Date("05 February 2023 16:00 UTC");

    const modifiedExceptions = await EntryException.where("modified").equals(
      true
    );
    expect(modifiedExceptions.length).toEqual(1);
    expect(modifiedExceptions[0]).toEqual(
      expect.objectContaining({
        title: "Listen to Country Roads",
        startTimeUtc: febFifth1600,
        endTimeUtc: dayAfter(febFifth1600),
        description: "by J. Denver",
        allDay: false,
      })
    );

    const deletedExceptions = await EntryException.where("deleted").equals(
      true
    );
    expect(deletedExceptions[0]).toEqual(
      expect.objectContaining({
        startTimeUtc: febFourth1600,
        deleted: true,
      })
    );
  });

  it("catches and returns an error from CalendarEntry.findByIdAndUpdate", async () => {
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

const generateRecurrenceData = () => {
  const janFourth = new Date("04 January 2023 14:48 UTC");
  const oneYearLater = yearAfter(janFourth);

  const rule = new RRule({
    freq: RRule.MONTHLY,
    dtstart: janFourth,
    until: oneYearLater,
  });

  const recurrences = rule.all();

  const febFourth = recurrences[1];
  const marFourth = recurrences[2];
  const febFifth = new Date("05 February 2023 14:48 UTC");
  const updatedEndDate = dayAfter(febFifth);

  return {
    janFourth,
    oneYearLater,
    rule,
    recurrences,
    febFourth,
    marFourth,
    febFifth,
    updatedEndDate,
  };
};
