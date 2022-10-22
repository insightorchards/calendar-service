const { MongoClient } = require("mongodb");
const supertest = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { app } = require("./app");
let client;
let mongod;
let dbConnection;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  mongod = await MongoMemoryServer.create();
  client = await new MongoClient(mongod.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).connect();
});

afterAll((done) => {
  process.env.NODE_ENV = "dev";
  client.close();
  mongod.stop();
  done();
});

describe("POST /", () => {
  it("POST / => seeded database items", async () => {
    // console.log("total items", dbConnection.collection('calendarEntries').count())
    await supertest(app).post("/seedDatabase").expect(201);
    // EB_TODO: Add assertion to show that 3 more items exist in the DB now
  });
});
