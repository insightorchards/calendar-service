const supertest = require("supertest");
import { Calendar } from "../../models/calendar";
import { app } from "../../setupTestApp";
import { connectDB, dropCollections, dropDB } from "../../setupTestDb";

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

describe("GET /calendars/:id/entries", () => {
  beforeEach(async () => {
    const createCalendarResponse = await supertest(app)
      .post("/calendars")
      .send({
        eventId: "id of cosmic party event",
        creatorId: "id of creator of cosmic party",
        title: "Parties!",
      })
      .expect(201);

    const calendar = JSON.parse(createCalendarResponse.text);

    await supertest(app)
      .post("/calendars/:id/entries")
      .send({
        calendarId: calendar._id,
        creatorId: "id of creator of cosmic party",
        title: "Dance party at the Guggenheim",
        allDay: true,
        recurring: false,
        startTimeUtc: new Date("2023-05-30T07:00:00.000Z"),
        endTimeUtc: new Date("2023-05-31T06:59:59.999Z"),
      })
      .expect(201);

    await supertest(app)
      .post("/calendars/:id/entries")
      .send({
        calendarId: calendar._id,
        creatorId: "id of creator of cosmic party",
        title: "Dinner party at Le Louvre",
        allDay: true,
        recurring: false,
        startTimeUtc: new Date("2023-05-30T07:00:00.000Z"),
        endTimeUtc: new Date("2023-05-31T06:59:59.999Z"),
      })
      .expect(201);
  });

  it("gets all calendar entries by a calendarId", async () => {
    const calendar = await Calendar.findOne({}).sort({
      $natural: -1,
    });

    const response = await supertest(app)
      .get(`/calendars/${calendar._id}/entries`)
      .send()
      .expect(200);

    const entries = JSON.parse(response.text);
    expect(entries.length).toEqual(2);
  });
});
