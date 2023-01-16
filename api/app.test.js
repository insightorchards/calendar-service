const { connectDB, dropDB, dropCollections } = require("./setupTestDb");
const { CalendarEntry } = require("./models/calendarEntry");
const supertest = require("supertest");
const { app } = require("./app");
const { dayAfter, yearAfter } = require("./lib/dateHelpers");
const { RRule, RRuleSet, rrulestr } = require("rrule");
const { EntryException } = require("./models/entryException");

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
      }),
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
        "/entries?start=2023-01-01T08:00:00.000Z&end=2023-02-12T08:00:00.000Z",
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
        "/entries?start=2023-01-01T08:00:00.000Z&end=2023-02-12T08:00:00.000Z",
      )
      .expect(200);
    expect(response.body.length).toEqual(8);
  });

  it("catches and returns an error from CalendarEntry.find", async () => {
    const findMock = jest
      .spyOn(CalendarEntry, "find")
      .mockImplementation(() => ({
        where: jest.fn(() => ({
          equals: jest.fn(() => ({
            where: jest.fn(() => ({
              gte: jest.fn(() => ({
                where: jest.fn(() => ({
                  lte: jest.fn(() => {
                    throw new Error("error occurred");
                  }),
                  lt: jest.fn(),
                })),
              })),
              lt: jest.fn(() => ({
                where: jest.fn(() => ({ gt: jest.fn() })),
              })),
            })),
          })),
        })),
      }));

    const response = await supertest(app)
      .get(
        `/entries?start=2023-01-01T08:00:00.000Z&end=2023-02-12T08:00:00.000Z`,
      )
      .expect(400);

    expect(response.text).toEqual('{"message":"error occurred"}');
    findMock.mockRestore();
  });
});

describe("GET /entry/:entryId?start=<start-time>", () => {
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

  it("returns the requested recurring entry", async () => {
    const date = new Date("04 January 2023 14:48 UTC");
    const oneYearLater = yearAfter(date);

    const createdEventData = await supertest(app)
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
        frequency: "monthly",
        recurrenceEndsUtc: oneYearLater,
      })
      .expect(201);
    const createdEvent = JSON.parse(createdEventData.text);

    const rule = new RRule({
      freq: RRule.MONTHLY,
      dtstart: date,
      until: oneYearLater,
    });

    const recurrences = rule.all();

    const februaryFourth = recurrences[1];

    const response = await supertest(app)
      .get(`/entries/${createdEvent._id}?start=${februaryFourth}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        eventId: "123",
        creatorId: "456",
        title: "Happy day",
        description: "and a happy night too",
        allDay: false,
        recurring: true,
        startTimeUtc: februaryFourth.toISOString(),
        endTimeUtc: dayAfter(februaryFourth).toISOString(),
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
    const date = new Date("04 January 2023 14:48 UTC");
    const oneYearLater = yearAfter(date);

    const createdEventData = await supertest(app)
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
        frequency: "monthly",
        recurrenceEndsUtc: oneYearLater,
      })
      .expect(201);
    const createdEvent = JSON.parse(createdEventData.text);

    const rule = new RRule({
      freq: RRule.MONTHLY,
      dtstart: date,
      until: oneYearLater,
    });

    const recurrences = rule.all();

    const februaryFourth = recurrences[1];

    const exceptionCount = await EntryException.countDocuments();
    expect(exceptionCount).toEqual(0);

    const response = await supertest(app)
      .get(`/entries?start=${date}&end=${oneYearLater}`)
      .expect(200);
    expect(response.body.length).toEqual(11);

    await supertest(app)
      .delete(
        `/entries/${
          createdEvent._id
        }?start=${februaryFourth.toISOString()}&applyToSeries=false`,
      )
      .expect(200);

    const updatedExceptionCount = await EntryException.countDocuments();
    expect(updatedExceptionCount).toEqual(1);

    const updatedResponse = await supertest(app)
      .get(`/entries?start=${date}&end=${oneYearLater}`)
      .expect(200);
    expect(updatedResponse.body.length).toEqual(10);
  });

  it("catches and returns an error from CalendarEntry.deleteOne", async () => {
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
