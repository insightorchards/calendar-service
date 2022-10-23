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

describe("GET /entries", () => {
  it("returns the entries that exist in the database", async () => {
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

    const response = await supertest(app).get("/entries").expect(200);
    expect(response.body.length).toEqual(2);
  });
});
