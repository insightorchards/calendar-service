const supertest = require("supertest");
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

describe("GET /calendars", () => {
  beforeEach(async () => {
    await supertest(app)
      .post("/calendars")
      .send({
        eventId: "id of cosmic party event",
        creatorId: "id of creator of cosmic party",
        title: "Parties!",
      })
      .expect(201);

    await supertest(app)
      .post("/calendars")
      .send({
        eventId: "id of study party event",
        creatorId: "id of creator of study party",
        title: "Studying!",
      })
      .expect(201);
  });

  it("gets all calendars", async () => {
    const response = await supertest(app).get(`/calendars`).send().expect(200);
    const calendars = JSON.parse(response.text);
    expect(calendars).toHaveLength(2);
  });

  it("gets all calendars of an event", async () => {
    const response = await supertest(app)
      .get("/calendars?eventId=id of study party event")
      .send()
      .expect(200);
    const calendars = JSON.parse(response.text);
    expect(calendars).toHaveLength(1);
  });
});
