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
    await supertest(app)
      .post("/calendars")
      .send({
        eventId: "id of cosmic party event",
        creatorId: "id of creator of cosmic party",
        title: "Parties!",
      })
      .expect(201);
  });

  it("expects start and end to be passed", async () => {
    const calendar = await Calendar.findOne({}).sort({
      $natural: -1,
    });

    const response = await supertest(app)
      .get(`/calendars/${calendar._id}/entries`)
      .send()
      .expect(400);

    expect(JSON.parse(response.text).message).toEqual(
      `Expected start, end to be passed`
    );
  });
});

describe("GET /calendars/:id/entries?start=<start-time>&end=<end-time>", () => {
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

  it("gets all calendar entries that starts and ends within the range", async () => {
    const calendar = await Calendar.findOne({}).sort({
      $natural: -1,
    });

    await supertest(app)
      .post(`/calendars/${calendar._id}/entries`)
      .send({
        creatorId: "id of creator of cosmic party",
        title: "Dance party at the Guggenheim",
        allDay: true,
        recurring: false,
        startTimeUtc: new Date("2023-05-30T07:00:00.000Z"),
        endTimeUtc: new Date("2023-05-31T06:59:59.999Z"),
      })
      .expect(201);

    await supertest(app)
      .post(`/calendars/${calendar._id}/entries`)
      .send({
        calendarId: calendar._id,
        creatorId: "id of creator of cosmic party",
        title: "Dinner party at Le Louvre",
        allDay: true,
        recurring: false,
        startTimeUtc: new Date("2023-06-15T07:00:00.000Z"),
        endTimeUtc: new Date("2023-06-16T06:59:59.999Z"),
      })
      .expect(201);

    await supertest(app)
      .post(`/calendars/${calendar._id}/entries`)
      .send({
        calendarId: calendar._id,
        creatorId: "id of creator of cosmic party",
        title: "Desert party atop the Eifel",
        allDay: true,
        recurring: false,
        startTimeUtc: new Date("2023-06-16T07:00:00.000Z"),
        endTimeUtc: new Date("2023-06-17T07:00:00.000Z"),
      })
      .expect(201);

    const response = await supertest(app)
      .get(
        `/calendars/${calendar._id}/entries?start=2023-05-30T07:00:00.000Z&end=2023-06-16T06:59:59.999Z`
      )
      .send()
      .expect(200);

    const entries = JSON.parse(response.text);
    expect(entries.length).toEqual(2);

    expect(entries[0]).toEqual(
      expect.objectContaining({
        title: "Dance party at the Guggenheim",
      })
    );

    expect(entries[1]).toEqual(
      expect.objectContaining({
        title: "Dinner party at Le Louvre",
      })
    );
  });

  it("gets all calendar entries that starts within the range but ends after the range end", async () => {
    const calendar = await Calendar.findOne({}).sort({
      $natural: -1,
    });

    await supertest(app)
      .post(`/calendars/${calendar._id}/entries`)
      .send({
        creatorId: "id of creator of cosmic party",
        title: "Dance party at the Guggenheim",
        allDay: true,
        recurring: false,
        startTimeUtc: new Date("2023-05-30T07:00:00.000Z"),
        endTimeUtc: new Date("2023-06-01T06:59:59.999Z"),
      })
      .expect(201);

    const response = await supertest(app)
      .get(
        `/calendars/${calendar._id}/entries?start=2023-05-30T07:00:00.000Z&end=2023-05-30T08:00:00.000Z`
      )
      .send()
      .expect(200);

    const entries = JSON.parse(response.text);
    expect(entries.length).toEqual(1);

    expect(entries[0]).toEqual(
      expect.objectContaining({
        title: "Dance party at the Guggenheim",
      })
    );
  });

  it("gets all calendar recurring entries that starts before the range start but ends after the range start", async () => {
    const calendar = await Calendar.findOne({}).sort({
      $natural: -1,
    });

    await supertest(app)
      .post(`/calendars/${calendar._id}/entries`)
      .send({
        calendarId: calendar._id,
        creatorId: "id of creator of cosmic party",
        title: "Fantasic Ball Marathon",
        allDay: false,
        recurring: true,
        startTimeUtc: new Date("2023-06-16T23:00:00.000Z"),
        endTimeUtc: new Date("2023-06-18T23:00:00.000Z"),
        frequency: "weekly",
        recurrenceEndsUtc: new Date("2023-06-16T23:00:00.000Z"),
      })
      .expect(201);

    const response = await supertest(app)
      .get(
        `/calendars/${calendar._id}/entries?start=2023-06-16T23:00:00.001Z&end=2023-06-17T00:00:00.000Z`
      )
      .send()
      .expect(200);

    const entries = JSON.parse(response.text);
    expect(entries.length).toEqual(1);
  });

  it("gets all calendar recurring entries that starts and ends within the range", async () => {
    const calendar = await Calendar.findOne({}).sort({
      $natural: -1,
    });

    await supertest(app)
      .post(`/calendars/${calendar._id}/entries`)
      .send({
        calendarId: calendar._id,
        creatorId: "id of creator of cosmic party",
        title: "Fantasic Ball",
        allDay: false,
        recurring: true,
        startTimeUtc: new Date("2023-06-16T18:00:00.000Z"),
        endTimeUtc: new Date("2023-06-16T19:00:00.000Z"),
        frequency: "weekly",
        recurrenceEndsUtc: new Date("2023-07-01T06:59:59.999Z"),
      })
      .expect(201);

    const response = await supertest(app)
      .get(
        `/calendars/${calendar._id}/entries?start=2023-06-01T07:00:00.000Z&end=2023-07-01T06:59:59.999Z`
      )
      .send()
      .expect(200);

    const entries = JSON.parse(response.text);
    expect(entries.length).toEqual(3);
  });

  it("gets all calendar recurring entries that starts within the range but ends after the range end", async () => {
    const calendar = await Calendar.findOne({}).sort({
      $natural: -1,
    });

    await supertest(app)
      .post(`/calendars/${calendar._id}/entries`)
      .send({
        calendarId: calendar._id,
        creatorId: "id of creator of cosmic party",
        title: "Fantasic Ball",
        allDay: false,
        recurring: true,
        startTimeUtc: new Date("2023-06-16T23:00:00.000Z"),
        endTimeUtc: new Date("2023-06-17T04:00:00.000Z"),
        frequency: "weekly",
        recurrenceEndsUtc: new Date("2023-07-01T06:59:59.999Z"),
      })
      .expect(201);

    const response = await supertest(app)
      .get(
        `/calendars/${calendar._id}/entries?start=2023-06-16T23:00:00.000Z&end=2023-06-30T23:00:00.000Z`
      )
      .send()
      .expect(200);

    const entries = JSON.parse(response.text);
    expect(entries.length).toEqual(3);
  });
});
