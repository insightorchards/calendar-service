const { connectDB, dropDB, dropCollections } = require("./setupTestDb");
const { CalendarEntry } = require("./models/calendarEntry");
const supertest = require("supertest");
const { app } = require("./app");
const { dayAfter } = require("./lib/dateHelpers");

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
        description: "and a happy night too",
      }),
    );
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
      isAllDay: false,
      startTimeUtc: today,
      endTimeUtc: dayAfter(today),
    });
    CalendarEntry.create({
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Dog walk",
      description: "Time for Scottie walking",
      isAllDay: false,
      startTimeUtc: today,
      endTimeUtc: dayAfter(today),
    });
  });

  it("returns the entries that exist in the database", async () => {
    const response = await supertest(app).get("/entries").expect(200);
    expect(response.body.length).toEqual(2);
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
      isAllDay: false,
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
        isAllDay: false,
        startTimeUtc: today.toISOString(),
        endTimeUtc: dayAfter(today).toISOString(),
      }),
    );
  });
});

describe("DELETE / entry", () => {
  let data;

  beforeEach(async () => {
    const count = await CalendarEntry.countDocuments();
    expect(count).toEqual(0);
    const startTime = new Date();
    const endTime = new Date();
    data = await CalendarEntry.create({
      eventId: "123",
      creatorId: "456",
      title: "Happy day",
      description: "and a happy night too",
      isAllDay: false,
      startTimeUtc: startTime,
      endTimeUtc: endTime,
    });
  });

  it("deletes the selected entry from the UI and database", async () => {
    await supertest(app).delete(`/entries/${data._id}`).expect(200);

    const newCount = await CalendarEntry.countDocuments();
    expect(newCount).toEqual(0);
  });
});
