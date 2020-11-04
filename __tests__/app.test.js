require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token;
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns songs', async() => {

      const expectation = [{ 'id':1, 'user_id':1, 'alias':'Shiela E.', 'name':'A Love Bizarre', 'alive':true, 'category':'Romance 1600', 'year':1985 }, { 'id':2, 'user_id':1, 'alias':'Shiela E.', 'name':'Koo Koo', 'alive':false, 'category':'Shiela E.', 'year':1987 }, { 'id':3, 'user_id':1, 'alias':'Shiela E.', 'name':'Love On a Blue Train', 'alive':false, 'category':'Shiela E.', 'year':1987 }, { 'id':4, 'user_id':1, 'alias':'Shiela E.', 'name':'Lemon Cake', 'alive':true, 'category':'Lemon Cake', 'year':2020 }, { 'id':5, 'user_id':1, 'alias':'Shiela E.', 'name':'Sister Fate', 'alive':true, 'category':'Romance 1600', 'year':1985 }, { 'id':6, 'user_id':1, 'alias':'Shiela E.', 'name':'Holly Rock', 'alive':false, 'category':'Krush Groove', 'year':1985 }, { 'id':7, 'user_id':1, 'alias':'Shiela E.', 'name':'Oliver House', 'alive':true, 'category':'The Glamorous Life', 'year':1984 }];
      const data = await fakeRequest(app)
        .get('/shielas')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns a single song', async() => {
      const expectation = { 'id':1, 'user_id':1, 'alias':'Shiela E.', 'name':'A Love Bizarre', 'alive':true, 'category':'Romance 1600', 'year':1985 };

      const data = await fakeRequest(app)
        .get('/shielas/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});

