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

describe("GET /calendars/:id", () => {
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

  it("gets a calendar by id", async () => {
    const calendarToGet = await Calendar.findOne({}).sort({
      $natural: -1,
    });

    const response = await supertest(app)
      .get(`/calendars/${calendarToGet._id}`)
      .send()
      .expect(200);

    const calendar = JSON.parse(response.text);
    expect(calendar).toEqual(
      expect.objectContaining({
        _id: calendarToGet._id.toString(),
        eventId: "id of cosmic party event",
        creatorId: "id of creator of cosmic party",
        title: "Parties!",
      })
    );
  });
});
