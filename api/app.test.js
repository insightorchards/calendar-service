const mongoose = require("mongoose");
const { connectDB, dropDB, dropCollections } = require("./setupTestDb");
const { CalendarEntry } = require('./models/calendarEntry')
const supertest = require("supertest");
const { app } = require("./app");

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await dropCollections();
});

afterAll(async () => {
  await dropDB();
});

describe("POST /", () => {
  it("POST / => seeded database items", async () => {
    const numBefore = await CalendarEntry.countDocuments()
    await supertest(app).post("/seedDatabase").expect(201);
    const numAfter = await CalendarEntry.countDocuments()
    expect(numAfter).toBeGreaterThan(numBefore)
  });
});
