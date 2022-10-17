import request from 'supertest';

const app = require('./app');

describe('GET /', () => {
  it('GET / => array of items', () => {
    return request(app)
      .get('/')

      .expect('Content-Type', /json/)

      .expect(200)
  })
})
