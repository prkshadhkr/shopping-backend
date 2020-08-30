const db = require("../db");
const partialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");

class Product {
  /** find all products (can filter on terms) */
  static async findAll(data){
    let baseQuery = `SELECT
        id, 
        name, 
        image, 
        brand,
        price, 
        category, 
        count_in_stock, 
        description,
        rating,
        num_reviews
      FROM products`;
    let whereExpression = [];
    let queryValues = [];

    if(data.search){
      queryValues.push(`%${data.search}%`);
      whereExpression.push(`name ILIKE $${queryValues.length}`)
    }
    if(whereExpression.length > 0){
      baseQuery += " WHERE ";
    }

    // finalize query and return result
    let finalQuery =
      baseQuery + whereExpression.join(" AND ") + " ORDER BY name";
    const products = await db.query(finalQuery, queryValues);
    return products.rows;
 } 

  /** given a product, return data about product. */
  static async findOne(id){
    const result = await db.query(
      `SELECT
        id,
        name, 
        image, 
        brand,
        price, 
        category, 
        count_in_stock, 
        description,
        rating,
        num_reviews
      FROM products 
      WHERE id = $1`,
      [id]
    );

    const product = result.rows[0];
    if(!product){
      throw new ExpressError(`There exists no product of id '${id}'`, 404)
    }

    // one to many relationships from products to reviews table
    const reviewRes = await db.query(
      `SELECT id, title, rating, comment
      FROM reviews
      WHERE product_id = $1`,
      [id]
    );
    product.reviews = reviewRes.rows;
    
    return product;
  }

  /** create a new product */
  static async create(data){
    const checkDuplicate = await db.query(
      `SELECT id, name
      FROM products
      WHERE id = $1`,
      [data.id]
    );
    
    if(checkDuplicate.rows[0]){
      throw new ExpressError(
        `There already exists a product with product id ${data.id}`
      )
    }

    const result = await db.query(
      `INSERT INTO products( 
        name,
        image,
        brand,
        price,
        category,
        count_in_stock,
        description
      )
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        name,
        image,
        brand,
        price,
        category,
        count_in_stock,
        description
      `,
      [
        data.name,
        data.image,
        data.brand,
        data.price,
        data.category,
        data.count_in_stock,
        data.description
      ]
    );

    return result.rows[0];
  }

  /** update product */
  static async update(id, data){
    let { query, values } = partialUpdate(
      "products",
      data,
      "id",
      id
    );

    const result = await db.query(query, values);
    const product = result.rows[0];

    if(!product){
      throw new ExpressError(`There exists no product of id '${id}'`, 404);
    }
    return product;
  }

  /** delete product from database; returns undefined */
  static async remove(id){
    const result = await db.query(
      `DELETE FROM products
      WHERE id = $1 
      RETURNING id `,
      [id]
    );
    if(result.rows.length === 0){
      throw new ExpressError(`There is no product of id '${id}'`, 404);
    }
  }

  /** add review of the product */
  static async addReview(id, data){
    //find product
    const product = await this.findOne(id);

    //insert into reviews
    const result = await db.query(
      `INSERT INTO reviews (product_id, title, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING id, product_id, title, rating, comment`, 
      [ 
        id,
        data.title,
        data.rating,
        data.comment
      ]
    );
    
    // update reviews and ratings of product:
    const numReviews = product.reviews.length + 1;
    product.reviews.push(result.rows[0]);
    const avgRating = 
      product.reviews.reduce((a, c) => a + c.rating, 0) / numReviews
    
    // update product as reviews changed
    await db.query(
      `UPDATE products 
      SET num_reviews = $1, 
        rating = $2
      WHERE id = $3`,
      [numReviews, avgRating, product.id]
    );

    return result.rows[0];
  }

  /** get reviews from product id */
    static async findAllReviewsByProductId( id ){
      const result = await db.query(
        `SELECT 
          id,
          product_id,
          title, 
          rating, 
          comment
        FROM reviews
        WHERE product_id = $1`,
        [id]
      );
      return result.rows;
    }

  /** delete review from database, returns undefined */
  static async removeReview(id, rId){
    const result = await db.query(
      `DELETE FROM reviews
      WHERE id = $1 
      RETURNING title`,
      [rId]
    );

    if(result.rows.length === 0){
      throw new ExpressError(`There is no review of id '${rId}'`, 404);
    }

    const product = await this.findOne(id);
    const numReviews = product.reviews.length;
    
    // remove a review from reviews
    for(let i = 0; i < numReviews; i++){
      if(product.reviews[i] === rId){
        product.review.splice(i, 1);
      }
    }

    const avgRating = 
    ( product.reviews.reduce((a, c) => a + c.rating, 0) / numReviews ) || 0;

    // update product as reviews changed
    await db.query(
      `UPDATE products 
      SET num_reviews = $1, 
        rating = $2
      WHERE id = $3`,
      [numReviews, avgRating, id]
    );
  }
}

module.exports = Product;