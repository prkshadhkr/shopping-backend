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

/** POST /product return { product } */
describe('POST / products /new', function () {
  test('add products if user has admin rights', async function () {
    let response = await request(app)
      .post(`/products/new`)
      .send({
        name : "chicken",
			  image : "www.chicken.com/img",
			  brand : "Tyson",
		  	price : 2.99,
			  category : "Meat",
			  count_in_stock : 17,
			  description : "Chicken tender",
			  _token : TEST_OBJ['tokenAdmin']
    });
    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({product: expect.any(Object)});
  });

  test('Unauthrized if user is not admin ', async function () {
    let response = await request(app)
      .post(`/products/new`)
      .send({
        name: "pork",
			  image: "www.pork.com/img",
			  brand: "Boarhead",
			  price: 12.99,
			  category: "Meat",
			  count_in_stock : 27,
			  description: "Pork chop",
		  	_token : TEST_OBJ['tokenUser']
    });
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({
      status: 401,
      message: "You must have an admin to access"
    });
  });
});

/**GET/products returns[ products ] */
describe('GET / products', function (){
  test('returns all products', async function() {
    const response = await request(app)
      .get(`/products`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({products: expect.any(Object)});
  });
});

/**GET/products/id returns{ product: {product info}}*/
describe('GET / products / :id', function () {
  test('return info about specific product', async function() {
    console.log('================= product id', TEST_OBJ.currentProductId);
    const response = await request(app)
      .get(`/products/${TEST_OBJ.curentProductId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({product: {
      id: TEST_OBJ['currentProductId'],
      name: "potato",
      image: "www.potato.com/img",
      brand: "potato",
      price: "3.99",
      category: "vegetable",
      count_in_stock: 23,
      description: "Yum",
      rating: "0.0",
      num_reviews : 0,
      reviews: []
    }});
  });
});

/**PATCH /products/id returns{ product: {product info}}*/
describe('PATCH / products / :id', function () {
  test('admin can update a product', async function() {
    const response = await request(app)
      .patch(`/products/${TEST_OBJ.currentProductId}`)
      .send({
        name: "POTATO",
        image: "WWW.POTATO.COM/IMG",
        brand: "POTATO",
        price: 3.99,
        category: "VEGETABLE",
        count_in_stock: 23,
        description: "YUM",
        _token: TEST_OBJ['tokenAdmin']
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({product: {
      id: TEST_OBJ['currentProductId'],
      name: "POTATO",
      image: "WWW.POTATO.COM/IMG",
      brand: "POTATO",
      price: "3.99",
      category: "VEGETABLE",
      count_in_stock: 23,
      description: "YUM",
      rating: "0.0",
      num_reviews : 0,
    }});
  });

  // regular user cannot update a product
  test('User cannot update a product', async function() {
    const response = await request(app)
      .patch(`/products/${TEST_OBJ.currentProductId}`)
      .send({
        name: "potato",
        image: "www.potato.com/img",
        brand: "potato",
        price: 3.99,
        category: "vegetable",
        count_in_stock: 23,
        description: "Yum",
        _token: TEST_OBJ['tokenUser']
      });
    
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({
      status: 401,
      message : "You must have an admin to access"
    });
  });
});

/** POST / {reviews} returns { review: {review} } */
describe('POST /: id / reviews', function () {
  test('User can post a review of a product', async function() {
    const response = await request(app)
      .post(`/products/${TEST_OBJ.currentProductId}/reviews`)
      .send({
        title: "Liked it",
        rating: 4,
        comment: "Great",
        _token: TEST_OBJ['tokenUser']
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({ review : 
      expect.any(Object)});
  });

  test('Unauthorized to post a review if not a user', async function() {
    const response = await request(app)
      .post(`/products/${TEST_OBJ.currentProductId}/reviews`)
      .send({
        title: "Do not like this product",
        rating: 1,
        comment: "Worst Potatos",
        _token: "garbage-token"
      });
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({
      status: 401,
      message: "You must authenticate first"
    });
  });
});

describe('DELETE / products / :id', function(){
  test('Cannot delete a product if not admin', async function(){
    const response = await request(app)
      .delete(`/products/${TEST_OBJ.currentProductId}`)
      .send({ 
        _token: TEST_OBJ['tokenUser']
      });
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({
      status: 401,
      message: "You must have an admin to access"
    });
  });

  test('Admin can delete a product', async function(){
    const response = await request(app)
      .delete(`/products/${TEST_OBJ.currentProductId}`)
      .send({ 
        _token: TEST_OBJ['tokenAdmin']
      });
    expect(response.body).toMatchObject({
      message: "Product deleted"
    });
  });
});

afterEach ( async function() {
  await afterEachTest();
});

afterAll ( async function() {
  await afterAllTest();
});