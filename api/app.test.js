const supertest = require("supertest");
const app = require('./app');
const { connectToDatabase, disconnectDatabase, getDb } = require("./db/connect");

let db

beforeEach(() => {
   connectToDatabase("jestDb", async () => {
    db = getDb();
    console.log({db})
  })
});

afterEach(() => {
  db.dropDatabase();
  disconnectDatabase()
});

describe('GET /', () => {
  it('GET / => array of items', () => {
    console.log("this is a test")
  })
})
