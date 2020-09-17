process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../app");
const {
  beforeEachTest,
  afterEachTest,
  afterAllTest,
  TEST_OBJ
} = require("./config");


beforeEach ( async function() {
  await beforeEachTest(TEST_OBJ);
});

/** POST /users return { JWT } */
describe('POST / users', function() {
  test('return { username }', async function() {
    const response = await request(app)
    .post(`/users`)
    .send({
      username: 'testuser',
      first_name: 'testuser first',
      last_name: 'testuser last',
      email: 'testuser@gmail.com',
      password: 'verysecret'
    });
    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({token : expect.any(String)});
  })
});

/** POST /login return { JWT } */
describe('POST /login ', function () {
  test('returns jwt after successful login', async function () {
    const response = await request(app)
    .post(`/login`)
    .send({
      username: 'cow',
      password: 'cow'
    });
  expect(response.statusCode).toBe(200);
  expect(response.body).toMatchObject({token: expect.any(String)});
  });

  test('returns with wrong password', async function () {
    const response = await request(app)
      .post(`/login`)
      .send({
        username: 'cow',
        password: 'WRONG'
        });
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({
    status: 401,
    message: "Invalid password"
    });
  })
});

/**GET/users returns[ users ] */
describe('GET / users', function (){
  test('returns all users for user with admin right', async function() {
    const response = await request(app)
      .get(`/users`)
      .send({ 
        _token: TEST_OBJ['tokenAdmin']
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject(expect.any(Object));
  });

  test('returns unauthorized for not a user', async function () {
    const response = await request(app)
      .get(`/users`)
      .send({ 
        _token: "garbage-token-from-bad-user" 
      });
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({
      status : 401,
      message : "You must have an admin to access"
    });
  });

  test('returns unauthorized for a user not admin', async function () {
    const response = await request(app)
      .get(`/users`)
      .send({
        _token : TEST_OBJ['tokenUser']
      });
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({
      status : 401,
      message : "You must have an admin to access"
    });
  });
});

/**GET/users/username returns{ user: {username} */
describe('GET / users / username', function () {
  test('return only about login user him/herself', async function() {
    const response = await request(app)
      .get(`/users/cow`)
      .send({
        _token : TEST_OBJ['tokenUser']
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject(expect.any(Object));
  });

  test('return unauthorized for inappropriate user', async function() {
    const response = await request(app)
      .get(`/users/admin`)
      .send({
         _token: TEST_OBJ['tokenUser']
      });
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({
      status : 401,
      message : "Unauthorized"
    });
  });
});

/**PATCH / users / user return { user: {username}} */
describe('PATCH / users / username', function () {
  test('update authorized user to update their info', async  function (){
    const response = await request(app)
      .patch(`/users/cow`)
      .send({ 
        first_name: "COW FIRST",
        last_name: "COW LAST",
        email: "cow@gmail.com",
        password: "cow",
        _token: TEST_OBJ['tokenUser']
      });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      user: expect.any(Object)
    });
  });

  test('update unauthorized user', async  function (){
    const response = await request(app)
      .patch(`/users/admin`)
      .send({ 
        first_name: "ADMIN",
        last_name: "ADMIN LAST",
        email: "adminemail@gmail.com",
        password: "wrong",
        _token: 'garbage-token-bad-user'
      });
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      status: 401,
      message: "Unauthorized"
    });
  });
});

afterEach ( async function() {
  await afterEachTest();
});

afterAll ( async function() {
  await afterAllTest();
});