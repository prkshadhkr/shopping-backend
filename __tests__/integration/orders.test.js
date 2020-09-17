// process.env.NODE_ENV = "test";

// const request = require("supertest");
// const app = require("../../app");
// const db = require ("../../db");
// const {
//   beforeEachTest,
//   afterEachTest,
//   afterAllTest,
//   TEST_OBJ
// } = require("./config");


// beforeEach ( async function() {
//   await beforeEachTest(TEST_OBJ);
// });

// /** POST /orders return { order } */
// describe('POST / orders', function () {
//   test('Create a order if user is authorized', async function () {
//     //lets get product ids first
//     const resPotato = await db.query(
//       `SELECT id, name from products
//       WHERE name = $1`,
//       ['potato']);
//     const potato = resPotato.rows[0];
//     const resApple = await db.query(
//       `SELECT id, name from products
//       WHERE name = $1`,
//       ['apple']);
//     const apple = resApple.rows[0];
//     const response = await request(app)
//       .post(`/orders`)
//       .send({
//         products: [
//           { id: potato.id, qty: 3 },
//           { id: apple.id, qty: 2 }
//         ],
//          _token: TEST_OBJ.tokenUser1
//       });
//     expect(response.statusCode).toBe(201);
//     expect(response.body).toMatchObject({order: expect.any(Object)});
//   });

//   test('Unauthorized if user does not exist', async function () {
//     //lets get product ids first
//     const resPotato = await db.query(
//       `SELECT id, name from products
//       WHERE name = $1`,
//       ['potato']);
//     const potato = resPotato.rows[0];
//     const resApple = await db.query(
//       `SELECT id, name from products
//       WHERE name = $1`,
//       ['apple']);
//     const apple = resApple.rows[0];
//     const response = await request(app)
//       .post(`/orders`)
//       .send({
//         products: [
//           { id: potato.id, qty: 30 },
//           { id: apple.id, qty: 26 }
//         ],
//          _token: "bad-user-garbarge-token"
//       });
//     expect(response.statusCode).toBe(401);
//     expect(response.body).toMatchObject({
//       status: 401,
//       message: "You must authenticate first"
//     });
//   });
// });

// /** GET /orders return { orders } */
// describe('GET / orders', function () {
//   test('Admin should have access of all orders', async function () {
//     const response = await request(app)
//       .get('/orders')
//       .send({
//         _token: TEST_OBJ.tokenAdmin
//       });
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toMatchObject({ orders: expect.any(Array) });
//   });

//   test('Unauthorized if not an Admin', async function () {
//     const response = await request(app)
//       .get('/orders')
//       .send({
//         _token: TEST_OBJ.tokenUser1
//       });
//     expect(response.statusCode).toBe(401);
//     expect(response.body).toMatchObject({
//       status: 401,
//       message: "You must have an admin to access"
//     });
//   });
// });

// /** GET /order /: username return { order } */
// describe('GET / orders /: username', function () {
//   test('correct user should access their order', async function () {
//     const response = await request(app)
//       .get('/orders/test2')
//       .send({
//         _token: TEST_OBJ.tokenUser2
//       });
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toMatchObject({ orders: expect.any(Array) });
//   });

//   test('bad user should not access any orders', async function () {
//     const response = await request(app)
//       .get('/orders/test2')
//       .send({
//         _token: "garbage-token-from-bad-user"
//       });
//     expect(response.statusCode).toBe(401);
//     expect(response.body).toMatchObject({
//       status: 401,
//       message: "Unauthorized"
//     });
//   });
// });

// describe('POST / shipping', function () {
//   test('correct user should access their order', async function () {

//     //lets find the order id for an user.
//     const resOrder = await db.query(
//       `SELECT u.username, o.id FROM users AS u
//       LEFT JOIN orders AS o 
//       ON u.id = o.user_id
//       WHERE username = $1`,
//       ['test2']
//     );
//     const order = resOrder.rows[0];
//     //lets post the shipping for an user once order id is found
//     const response = await request(app)
//       .post('/orders/shipping')
//       .send({
//         order_id: order.id,
//         address: "123 Man street",
//         city: "Ford City",
//         zip_code: "12345",
//         _token: TEST_OBJ.tokenUser2
//       });
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toMatchObject({ shipping: expect.any(Object) });
//   });

//   test('Bad user should not access others order', async function () {

//     //lets find the order id for an user.
//     const resOrder = await db.query(
//       `SELECT u.username, o.id FROM users AS u
//       LEFT JOIN orders AS o 
//       ON u.id = o.user_id
//       WHERE username = $1`,
//       ['test2']
//     );
//     const order = resOrder.rows[0];
//     //lets post the shipping using bad user
//     const response = await request(app)
//       .post('/orders/shipping')
//       .send({
//         order_id : order.id,
//         address : "Mystry street",
//         city : "Bad City",
//         zip_code : "12345",
//         _token : "bad-token-from-bad-user"
//       });
//     expect(response.statusCode).toBe(401);
//     expect(response.body).toMatchObject({
//       status : 401,
//       message : "Unauthorized" 
//     });
//   });

//   /**DELETE / :id  return { order deleted} */
//   describe('DELETE / orders /:id ', function() {
//     test('admin can delete an order', async function() {
//     //lets find the order id for an user.
//     const resOrder = await db.query(
//       `SELECT u.username, o.id FROM users AS u
//       LEFT JOIN orders AS o 
//       ON u.id = o.user_id
//       WHERE username = $1`,
//       ['test2']
//     );
//     const order = resOrder.rows[0];
//     const response = await request(app)
//       .delete(`/orders/${order.id}`)
//       .send({
//         _token: TEST_OBJ.tokenAdmin
//       });
//     expect(response.body).toMatchObject({
//         message: "Order deleted"
//       });
//     });
//   });
// });

// afterEach ( async function() {
//   await afterEachTest();
// });

// afterAll ( async function() {
//   await afterAllTest();
// });


/************************************************************** */



// process.env.NODE_ENV = "test";

// const request = require("supertest");
// const app = require("../app");
// const db = require("../db");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { SECRET_KEY } = require("../config");
// const BCRYPT_WORK_FACTOR = 1;
// let testUserToken2;
// let testAdminToken2;

// beforeEach( async function() {
//   const hPassword = await bcrypt.hash('secret2', BCRYPT_WORK_FACTOR);

//   await db.query(
//     `INSERT INTO users
//     (username, first_name, last_name, email, password, is_admin)
//     VALUES ($1, $2, $3, $4, $5, $6)
//     RETURNING username, first_name, last_name, email, password, is_admin`,
//     ['test2', 'test first', 'test last', 'test@gmail.com', hPassword, false]);
//   await db.query(
//     `INSERT INTO users
//     (username, first_name, last_name, email, password, is_admin)
//     VALUES ($1, $2, $3, $4, $5, $6)
//     RETURNING username, first_name, last_name, email, password, is_admin`,
//     ['admin2', 'admin first', 'admin last', 'admin@gmail.com', hPassword, true ]);
  
//   const testUser2 = { username: 'test2', password: hPassword, is_admin: false};
//   const testAdmin2 = { username: 'admin2', password: hPassword, is_admin: true};
//   testUserToken2 = jwt.sign(testUser2, SECRET_KEY);
//   testAdminToken2 = jwt.sign(testAdmin2, SECRET_KEY);

//   //add a product - 'potato'
//   await db.query(
//     `INSERT INTO products ( 
//       name, image, brand, price, category, count_in_stock, description )
//     VALUES ($1, $2, $3, $4, $5, $6, $7)
//     RETURNING name, image, brand, price, category, count_in_stock, description `,
//     [
//       'potato',
//       'www.potato.com/img',
//       'potato',
//       3.99,
//       'vegetable',
//       23,
//       'Yum'
//     ]
//   );

//   // add a product - 'apple'
//   await db.query(
//     `INSERT INTO products ( 
//       name, image, brand, price, category, count_in_stock, description )
//     VALUES ($1, $2, $3, $4, $5, $6, $7)
//     RETURNING name, image, brand, price, category, count_in_stock, description `,
//     [
//       'apple',
//       'www.apple.com/img',
//       'apple',
//       4.99,
//       'fruit',
//       33,
//       'Crispy'
//     ]
//   );

//   const resUser = await db.query(`
//     SELECT id, username FROM users WHERE username = $1`,['test2']);
//   const user = resUser.rows[0];
//   await db.query(`
//     INSERT INTO orders ( user_id ) 
//     VALUES ($1 ) 
//     RETURNING id`,
//     [user.id]
//   );
// });

// /** POST /orders return { order } */
// describe('POST / orders', function () {
//   test('Create a order if user is authorized', async function () {
//     //lets get product ids first
//     const resPotato = await db.query(
//       `SELECT id, name from products
//       WHERE name = $1`,
//       ['potato']);
//     const potato = resPotato.rows[0];
//     const resApple = await db.query(
//       `SELECT id, name from products
//       WHERE name = $1`,
//       ['apple']);
//     const apple = resApple.rows[0];
//     const response = await request(app)
//       .post(`/orders`)
//       .send({
//         products: [
//           { id: potato.id, qty: 3 },
//           { id: apple.id, qty: 2 }
//         ],
//          _token: testUserToken2
//       });
//     expect(response.statusCode).toBe(201);
//     expect(response.body).toMatchObject({order: expect.any(Object)});
//   });

//   test('Unauthorized if user does not exist', async function () {
//     //lets get product ids first
//     const resPotato = await db.query(
//       `SELECT id, name from products
//       WHERE name = $1`,
//       ['potato']);
//     const potato = resPotato.rows[0];
//     const resApple = await db.query(
//       `SELECT id, name from products
//       WHERE name = $1`,
//       ['apple']);
//     const apple = resApple.rows[0];
//     const response = await request(app)
//       .post(`/orders`)
//       .send({
//         products: [
//           { id: potato.id, qty: 30 },
//           { id: apple.id, qty: 26 }
//         ],
//          _token: "bad-user-garbarge-token"
//       });
//     expect(response.statusCode).toBe(401);
//     expect(response.body).toMatchObject({
//       status: 401,
//       message: "You must authenticate first"
//     });
//   });
// });

// /** GET /orders return { orders } */
// describe('GET / orders', function () {
//   test('Admin should have access of all orders', async function () {
//     const response = await request(app)
//       .get('/orders')
//       .send({
//         _token: testAdminToken2
//       });
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toMatchObject({ orders: expect.any(Array) });
//   });

//   test('Unauthorized if not an Admin', async function () {
//     const response = await request(app)
//       .get('/orders')
//       .send({
//         _token: testUserToken2
//       });
//     expect(response.statusCode).toBe(401);
//     expect(response.body).toMatchObject({
//       status: 401,
//       message: "You must have an admin to access"
//     });
//   });
// });

// /** GET /order /: username return { order } */
// describe('GET / orders /: username', function () {
//   test('correct user should access their order', async function () {
//     const response = await request(app)
//       .get('/orders/test2')
//       .send({
//         _token: testUserToken2
//       });
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toMatchObject({ orders: expect.any(Array) });
//   });

//   test('bad user should not access any orders', async function () {
//     const response = await request(app)
//       .get('/orders/test2')
//       .send({
//         _token: "garbage-token-from-bad-user"
//       });
//     expect(response.statusCode).toBe(401);
//     expect(response.body).toMatchObject({
//       status: 401,
//       message: "Unauthorized"
//     });
//   });
// });

// describe('POST / shipping', function () {
//   test('correct user should access their order', async function () {

//     //lets find the order id for an user.
//     const resOrder = await db.query(
//       `SELECT u.username, o.id FROM users AS u
//       LEFT JOIN orders AS o 
//       ON u.id = o.user_id
//       WHERE username = $1`,
//       ['test2']
//     );
//     const order = resOrder.rows[0];
//     //lets post the shipping for an user once order id is found
//     const response = await request(app)
//       .post('/orders/shipping')
//       .send({
//         order_id: order.id,
//         address: "123 Man street",
//         city: "Ford City",
//         zip_code: "12345",
//         _token: testUserToken2
//       });
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toMatchObject({ shipping: expect.any(Object) });
//   });

//   test('Bad user should not access others order', async function () {

//     //lets find the order id for an user.
//     const resOrder = await db.query(
//       `SELECT u.username, o.id FROM users AS u
//       LEFT JOIN orders AS o 
//       ON u.id = o.user_id
//       WHERE username = $1`,
//       ['test2']
//     );
//     const order = resOrder.rows[0];
//     //lets post the shipping using bad user
//     const response = await request(app)
//       .post('/orders/shipping')
//       .send({
//         order_id : order.id,
//         address : "Mystry street",
//         city : "Bad City",
//         zip_code : "12345",
//         _token : "bad-token-from-bad-user"
//       });
//     expect(response.statusCode).toBe(401);
//     expect(response.body).toMatchObject({
//       status : 401,
//       message : "Unauthorized" 
//     });
//   });

//   /**DELETE / :id  return { order deleted} */
//   describe('DELETE / orders /:id ', function() {
//     test('admin can delete an order', async function() {
//     //lets find the order id for an user.
//     const resOrder = await db.query(
//       `SELECT u.username, o.id FROM users AS u
//       LEFT JOIN orders AS o 
//       ON u.id = o.user_id
//       WHERE username = $1`,
//       ['test2']
//     );
//     const order = resOrder.rows[0];
//     const response = await request(app)
//       .delete(`/orders/${order.id}`)
//       .send({
//         _token: testAdminToken2
//       });
//     expect(response.body).toMatchObject({
//         message: "Order deleted"
//       });
//     });
//   });
// });

// afterEach( async function() {
//   await db.query(`DELETE FROM orders`);
//   await db.query(`DELETE FROM products`);
//   await db.query(`DELETE FROM users`);

// });

// afterAll( async function() {
//   await db.end();
// });
