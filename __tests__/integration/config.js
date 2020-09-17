const request = require ("supertest");
const bcrypt = require ("bcrypt");
const jwt = require ("jsonwebtoken");

const app = require ("../../app");
const db = require ("../../db");
const { SECRET_KEY } = require("../../config");
const BCRYPT_WORK_FACTOR = 1;
const TEST_OBJ = {};

async function beforeEachTest(TEST_OBJ) {
  try {
    //lets make some users:
    const hpAdmin = await bcrypt.hash('admin', BCRYPT_WORK_FACTOR);
    const hpCow = await bcrypt.hash('cow', BCRYPT_WORK_FACTOR);

    await db.query(
      `INSERT INTO users
      (username, first_name, last_name, email, password, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING username, first_name, last_name, email, password, is_admin`,
      ['admin', 'admin first', 'admin last', 'admin@gmail.com', hpAdmin, true ]);
   
    await db.query(
      `INSERT INTO users
      (username, first_name, last_name, email, password, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING username, first_name, last_name, email, password, is_admin`,
      ['cow', 'cow first', 'cow last', 'cow@gmail.com', hpCow, false]);

    //Let's add some products:
    await db.query(
      `INSERT INTO products ( 
        name, image, brand, price, category, count_in_stock, description )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING name, image, brand, price, category, count_in_stock, description `,
      [
        'potato',
        'www.potato.com/img',
        'potato',
        3.99,
        'vegetable',
        23,
        'Yum'
      ]
    );

    await db.query(
      `INSERT INTO products ( 
        name, image, brand, price, category, count_in_stock, description )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING name, image, brand, price, category, count_in_stock, description`,
      [
        'apple',
        'www.apple.com/img',
        'apple',
        4.99,
        'fruit',
        33,
        'Crispy'
      ]
    );

    /** Lets login as different users first: */
    // admin:
    const resAdmin = await request(app)
      .post("/login")
      .send({
        username : "admin",
        password : "admin"
      });
    TEST_OBJ.tokenAdmin = resAdmin.body.token;
    TEST_OBJ.currentAdmin = jwt.decode(TEST_OBJ.tokenAdmin).username;

    // user1:
    const resCow = await request(app)
      .post("/login")
      .send({
        username : "cow",
        password : "cow"
      });
    TEST_OBJ.tokenUser = resCow.body.token;
    TEST_OBJ.currentUser = jwt.decode(TEST_OBJ.tokenUser).username;

    //lets add an order for user:
    const responseUser = await db.query(`
      SELECT id, username FROM users WHERE username = $1`, 
      [ TEST_OBJ.currentUser ]);
    const currUser = responseUser.rows[0];
    const orderRes = await db.query(`
      INSERT INTO orders ( user_id ) 
      VALUES ($1 ) 
      RETURNING id`,
      [currUser.id]
    );
    const order = orderRes.rows[0];
    TEST_OBJ.currentOrderId = order.id;

    const resProduct = await db.query(`
    SELECT id, name from products
    WHERE name = $1`,
    ['potato']);
    const product = resProduct.rows[0];
    TEST_OBJ.currentProductId = product.id;
    
  } catch (e) {
    console.error(e);
  }
}

async function afterEachTest() {
  try {
    await db.query(`DELETE FROM orders`);
    await db.query(`DELETE FROM products`);
    await db.query(`DELETE FROM users`)
  } catch (e) {
    console.error(e);
  }
}

async function afterAllTest() {
  try {
    await db.end();
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  beforeEachTest,
  afterEachTest,
  afterAllTest,
  TEST_OBJ
}