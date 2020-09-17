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

/** POST /orders return { order } */
describe('POST / orders', function () {
  test('Create a order if user is authorized', async function () {
    const response = await request(app)
      .post(`/orders`)
      .send({
        products: [
          { id: TEST_OBJ.currentProductId, qty: 3 }
        ],
         _token: TEST_OBJ.tokenUser
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({order: expect.any(Object)});
  });

  test('Unauthorized if user does not exist', async function () {
    const response = await request(app)
      .post(`/orders`)
      .send({
        products: [
          { id: TEST_OBJ.currentProductId, qty: 10 }
        ],
         _token: "bad-user-garbarge-token"
      });
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({
      status: 401,
      message: "You must authenticate first"
    });
  });
});

/** GET /orders return { orders } */
describe('GET / orders', function () {
  test('Admin should have access of all orders', async function () {
    const response = await request(app)
      .get('/orders')
      .send({
        _token: TEST_OBJ.tokenAdmin
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({ orders: expect.any(Array) });
  });

  test('Unauthorized if not an Admin', async function () {
    const response = await request(app)
      .get('/orders')
      .send({
        _token: TEST_OBJ.tokenUser
      });
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({
      status: 401,
      message: "You must have an admin to access"
    });
  });
});

/** GET /order /: username return { order } */
describe('GET / orders /: username', function () {
  test('correct user should access their order', async function () {
    const response = await request(app)
      .get('/orders/cow')
      .send({
        _token: TEST_OBJ.tokenUser
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({ orders: expect.any(Array) });
  });

  test('bad user should not access any orders', async function () {
    const response = await request(app)
      .get('/orders/cow')
      .send({
        _token: "garbage-token-from-bad-user"
      });
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({
      status: 401,
      message: "Unauthorized"
    });
  });
});

describe('POST / shipping', function () {
  test('correct user should access their order', async function () {
    const response = await request(app)
      .post('/orders/shipping')
      .send({
        order_id: TEST_OBJ.currentOrderId,
        address: "123 Man street",
        city: "Ford City",
        zip_code: "12345",
        _token: TEST_OBJ.tokenUser
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({ shipping: expect.any(Object) });
  });

  test('Bad user should not access others order', async function () {
    const response = await request(app)
      .post('/orders/shipping')
      .send({
        order_id : TEST_OBJ.currentOrderId,
        address : "Mystry street",
        city : "Bad City",
        zip_code : "12345",
        _token : "bad-token-from-bad-user"
      });
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({
      status : 401,
      message : "Unauthorized" 
    });
  });

  /**DELETE / :id  return { order deleted} */
  describe('DELETE / orders /:id ', function() {
    test('admin can delete an order', async function() {
    const response = await request(app)
      .delete(`/orders/${TEST_OBJ.currentOrderId}`)
      .send({
        _token: TEST_OBJ.tokenAdmin
      });
    expect(response.body).toMatchObject({
        message: "Order deleted"
      });
    });
  });
});

afterEach ( async function() {
  await afterEachTest();
});

afterAll ( async function() {
  await afterAllTest();
});

