const supertest = require("supertest");
import { Calendar } from "../../models/calendar";
import { app } from "../../setupTestApp";
import { connectDB, dropCollections, dropDB } from "../../setupTestDb.js";

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

describe("POST /calendars/:id/entries", () => {
  beforeEach(async () => {
    await supertest(app)
      .post("/calendars")
      .send({
        eventId: "id of cosmic party event",
        creatorId: "id of creator of cosmic party",
        title: "Parties!",
      })
      .expect(201);
  });

  it("creates a calendar entry", async () => {
    const calendar = await Calendar.findOne({}).sort({
      $natural: -1,
    });

    const START_TIME = "2023-05-30T07:00:00.000Z";
    const END_TIME = "2023-05-31T06:59:59.999Z";

    const response = await supertest(app)
      .post("/calendars/:id/entries")
      .send({
        calendarId: calendar._id,
        creatorId: "id of creator of cosmic party",
        title: "Cosmic Party!",
        allDay: true,
        recurring: false,
        startTimeUtc: new Date(START_TIME),
        endTimeUtc: new Date(END_TIME),
      })
      .expect(201);

    const createdCalendarEntry = JSON.parse(response.text);

    expect(createdCalendarEntry).toEqual(
      expect.objectContaining({
        _id: expect.anything(),
        calendarId: calendar._id.toString(),
        creatorId: "id of creator of cosmic party",
        title: "Cosmic Party!",
        allDay: true,
        recurring: false,
        startTimeUtc: "2023-05-30T07:00:00.000Z",
        endTimeUtc: "2023-05-31T06:59:59.999Z",
      })
    );
  });
});
