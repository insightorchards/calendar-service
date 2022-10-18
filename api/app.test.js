const { MongoClient } = require("mongodb");

const { MongoMemoryServer } = require("mongodb-memory-server");

let client;
let mongod;
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  client = new MongoClient(mongod.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).connect();
});

afterAll(async () => {
  await client.close();
  await mongod.stop();
});

describe("GET /", () => {
  it("GET / => array of items", async () => {
    console.log("this is a test");
  });
});
