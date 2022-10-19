const { MongoClient } = require("mongodb");
const supertest = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { app } = require("./app");
let client;
let mongod;

beforeAll(async () => {
  process.env.NODE_ENV = 'test'
  mongod = await MongoMemoryServer.create();
  client = await new MongoClient(mongod.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).connect();
});

afterAll(async () => {
  process.env.NODE_ENV = 'dev'
  await client.close();
  await mongod.stop();
});

describe("POST /", () => {
  it("POST / => seeded database items", async () => {
    await supertest(app)
      .post("/seedDatabase")
      .expect(201)
      .then((response) => {});
  });
});
