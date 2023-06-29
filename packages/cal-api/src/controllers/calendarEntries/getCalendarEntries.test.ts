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

  describe("required parameters", () => {
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

  describe("fetching non recurring entries", () => {
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
          `/calendars/${calendar._id}/entries?start=2023-05-30T07:00:00.000Z&end=2023-06-01T00:00:00.000Z`
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
  });

  describe("fetching recurring entries", () => {
    describe("when a recurring entry has a start time >= range start && <= range end", () => {
      it("returns all recurring entries within range", async () => {
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
            endTimeUtc: new Date("2023-06-16T22:45:00.000Z"),
            frequency: "weekly",
            recurrenceEndsUtc: new Date("2023-07-01T00:00:00.000Z"),
          })
          .expect(201);

        const response = await supertest(app)
          .get(
            `/calendars/${calendar._id}/entries?start=2023-06-01T07:00:00.000Z&end=2023-07-01T00:00:00.000Z`
          )
          .send()
          .expect(200);

        const entries = JSON.parse(response.text);
        expect(entries.length).toEqual(3);
      });
    });

    describe("when a recurring entry has a start time < range start", () => {
      describe("when recurring entry has an end time greater than range start but recurrence ends before the range start", () => {
        it("returns the recurring entry", async () => {
          const calendar = await Calendar.findOne({}).sort({
            $natural: -1,
          });

          const RANGE_START = new Date("2023-06-01").toISOString();
          const RANGE_END = new Date("2023-07-01").toISOString();

          await supertest(app)
            .post(`/calendars/${calendar._id}/entries`)
            .send({
              calendarId: calendar._id,
              creatorId: "id of creator of cosmic party",
              title: "The Final Ball",
              allDay: false,
              recurring: true,
              startTimeUtc: new Date("2023-05-31T18:00:00.000Z"),
              endTimeUtc: new Date("2023-06-01T02:00:00.000Z"),
              frequency: "weekly",
              recurrenceEndsUtc: new Date("2023-05-31T23:59:59.999Z"),
            })
            .expect(201);

          const response = await supertest(app)
            .get(
              `/calendars/${calendar._id}/entries?start=${RANGE_START}&end=${RANGE_END}`
            )
            .send()
            .expect(200);

          const entries = JSON.parse(response.text);
          expect(entries.length).toEqual(1);
          expect(entries[0]).toEqual(
            expect.objectContaining({
              startTimeUtc: "2023-05-31T18:00:00.000Z",
              endTimeUtc: "2023-06-01T02:00:00.000Z",
            })
          );
        });
      });

      describe("when recurring entry has an end time >= start and recurrence ends after the range start", () => {
        it("returns the recurring entry and all recurring entries within the range", async () => {
          const calendar = await Calendar.findOne({}).sort({
            $natural: -1,
          });

          const RANGE_START = new Date("2023-06-01").toISOString();
          const RANGE_END = new Date("2023-07-01").toISOString();

          await supertest(app)
            .post(`/calendars/${calendar._id}/entries`)
            .send({
              calendarId: calendar._id,
              creatorId: "id of creator of cosmic party",
              title: "The Past Midnight Ball",
              allDay: false,
              recurring: true,
              startTimeUtc: new Date("2023-05-31T18:00:00.000Z"),
              endTimeUtc: new Date("2023-06-01T02:00:00.000Z"),
              frequency: "weekly",
              recurrenceEndsUtc: new Date("2023-06-07T18:00:00.000Z"),
            })
            .expect(201);

          const response = await supertest(app)
            .get(
              `/calendars/${calendar._id}/entries?start=${RANGE_START}&end=${RANGE_END}`
            )
            .send()
            .expect(200);

          const entries = JSON.parse(response.text);
          expect(entries.length).toEqual(2);
          expect(entries[0]).toEqual(
            expect.objectContaining({
              startTimeUtc: "2023-05-31T18:00:00.000Z",
              endTimeUtc: "2023-06-01T02:00:00.000Z",
            })
          );
          expect(entries[1]).toEqual(
            expect.objectContaining({
              startTimeUtc: "2023-06-07T18:00:00.000Z",
              endTimeUtc: "2023-06-08T02:00:00.000Z",
            })
          );
        });
      });

      describe("when recurring entry has an end time before the range start but recurrence ends after the start", () => {
        it("returns all recurring entries that overlap the range OR within the range", async () => {
          const calendar = await Calendar.findOne({}).sort({
            $natural: -1,
          });

          const RANGE_START = new Date("2023-06-01").toISOString();
          const RANGE_END = new Date("2023-07-01").toISOString();

          await supertest(app)
            .post(`/calendars/${calendar._id}/entries`)
            .send({
              calendarId: calendar._id,
              creatorId: "id of creator of cosmic party",
              title: "The Right Before Midnight Ball",
              allDay: false,
              recurring: true,
              startTimeUtc: new Date("2023-05-31T18:00:00.000Z"),
              endTimeUtc: new Date("2023-05-31T23:59:59.999Z"),
              frequency: "weekly",
              recurrenceEndsUtc: new Date("2023-06-07T18:00:00.000Z"),
            })
            .expect(201);

          const response = await supertest(app)
            .get(
              `/calendars/${calendar._id}/entries?start=${RANGE_START}&end=${RANGE_END}`
            )
            .send()
            .expect(200);

          const entries = JSON.parse(response.text);
          expect(entries.length).toEqual(1);
          expect(entries[0]).toEqual(
            expect.objectContaining({
              startTimeUtc: "2023-06-07T18:00:00.000Z",
              endTimeUtc: "2023-06-07T23:59:59.999Z",
            })
          );
        });
      });

      describe("when recurring entry has an end time before the range start and recurrence ends before the range start", () => {
        it("returns no entries", async () => {
          const calendar = await Calendar.findOne({}).sort({
            $natural: -1,
          });

          const RANGE_START = new Date("2023-06-01").toISOString();
          const RANGE_END = new Date("2023-07-01").toISOString();

          await supertest(app)
            .post(`/calendars/${calendar._id}/entries`)
            .send({
              calendarId: calendar._id,
              creatorId: "id of creator of cosmic party",
              title: "The Right Before Midnight Ball",
              allDay: false,
              recurring: true,
              startTimeUtc: new Date("2023-05-31T18:00:00.000Z"),
              endTimeUtc: new Date("2023-05-31T23:59:59.999Z"),
              frequency: "weekly",
              recurrenceEndsUtc: new Date("2023-05-31T23:59:59.999Z"),
            })
            .expect(201);

          const response = await supertest(app)
            .get(
              `/calendars/${calendar._id}/entries?start=${RANGE_START}&end=${RANGE_END}`
            )
            .send()
            .expect(200);

          const entries = JSON.parse(response.text);
          expect(entries.length).toEqual(0);
        });
      });
    });

    describe("when a recurring entry starts at range start and recurrence ends on range end", () => {
      it("returns the entry at range start, entry at range end and all entries in between", async () => {
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
  });
});
