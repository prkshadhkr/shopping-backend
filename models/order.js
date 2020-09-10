const db = require("../db");
const ExpressError = require("../helpers/expressError");
const { SALES_TAX, SHIPPING_RATE } = require("../config");
const User = require("./user");

class Order {
  /** find all orders (can filter on terms) */
  static async findAll(data){
    let result = await db.query(`SELECT
        id, 
        user_id, 
        price, 
        tax_price,
        shipping_price, 
        total_price, 
        is_paid,
        is_delivered
      FROM orders
      ORDER BY id`
    );

    return result.rows;
 } 

  /** given a order, return data about order. */
  static async findOne(id){
    const result = await db.query(
      `SELECT
        id, 
        user_id, 
        price, 
        tax_price,
        shipping_price, 
        total_price, 
        is_paid,
        is_delivered
      FROM orders
      WHERE id = $1`,
      [id]
    );

    const order = result.rows[0];
    if(!order){
      throw new ExpressError(`There exists no order '${id}'`, 404)
    }

    // one to many relationships from user to orders table
    const userRes = await db.query(
      `SELECT username, first_name, last_name, email
      FROM users
      WHERE id = $1`,
      [order.user_id]
    );
    order.user = userRes.rows[0];

    //one to many relations from order to shipping table:
    const shippingRes = await db.query(
      `SELECT id, address, city, zip_code
      FROM shippings
      WHERE order_id = $1`,
      [order.id]
    );
    order.shipping = shippingRes.rows[0];

    //one to many relations from order to payment table:
    const paymentRes = await db.query(
      `SELECT id, pay_ref
      FROM payments
      WHERE order_id = $1`,
      [order.id]
    );
    order.payment = paymentRes.rows[0];
    
    return order;
  }

   /** find orders from specific user */
   static async findOrderByUser(username){
    const user = await User.findOne(username);
    const result = await db.query(
      `SELECT
        o.id, 
        o.user_id, 
        o.price, 
        o.tax_price,
        o.shipping_price, 
        o.total_price, 
        o.is_paid,
        o.is_delivered,
        s.address,
        s.city
      FROM orders AS o
      LEFT JOIN shippings AS s
      ON o.id = s.order_id
      WHERE user_id = $1
      AND o.is_paid = true`,
      [user.id]
    );

    const order = result.rows;
    if(!order){
      throw new ExpressError(`There exists no order for user id '${id}'`, 404)
    }
    return order;
  }

  /** create a new order */
  static async create(username){
    //finds the user id from username
    const userRes = await db.query(
      `SELECT id 
      FROM users
      WHERE username = $1`,
      [username]
    )
    const userId = userRes.rows[0].id;
    const result = await db.query(
      `INSERT INTO orders( user_id )
      VALUES ($1)
      RETURNING 
        id
      `,
      [ userId ]
    );
    return result.rows[0];
  }

  /** delete order from database; returns undefined */
  static async remove(id){
    const result = await db.query(
      `DELETE FROM orders
      WHERE id = $1 
      RETURNING id`,
      [id]
    );
    if(result.rows.length === 0){
      throw new ExpressError(`There is no order of id '${id}'`, 404);
    }
  }

  /** update order_itmes table */
  static async updateOrderItems(order_id, data){
    let priceSum = 0;
    for(let i = 0; i < data.products.length; i++){
      //finds the product info from product table
      const productRes = await db.query(
        `SELECT id, price, count_in_stock 
        FROM products
        WHERE id = $1`,
        [data.products[i].id]
      );
      
      const product = productRes.rows[0];
      //check if order qty is more that what we have in stock
      if(data.products[i].qty > product.count_in_stock){
        throw new ExpressError(
          `Product of id '${product.id}' available in stock ${product.count_in_stock}`)
      }
      const price = data.products[i].qty * product.price;
      priceSum += price;

      // insert each product into order_items table
      await db.query(
        `INSERT INTO order_items (
          order_id, 
          product_id, 
          qty,
          price)
        VALUES ($1, $2, $3, $4)
        RETURNING 
          order_id,
          product_id, 
          qty, 
          price`,
        [ order_id, 
          data.products[i].id, 
          data.products[i].qty, 
          price 
        ]
      );

      // update qty in product table:
      const qtyRemain = product.count_in_stock - data.products[i].qty;
      await db.query(
        `UPDATE products
        SET count_in_stock = $1
        WHERE id = $2`,
        [ qtyRemain,
          product.id
         ]
      );
    }

    // update order after updating order_items table:
    await db.query(
      `UPDATE orders
      SET price = $1,
        tax_price = $2,
        shipping_price = $3,
        total_price = $4
      WHERE id = $5`,
      [ priceSum,
        priceSum * SALES_TAX,
        priceSum * SHIPPING_RATE,
        priceSum * (1 + SALES_TAX + SHIPPING_RATE),
        order_id
      ]
    );
    return await this.findOne(order_id);
  }

  /** add shipping to the order */
  static async addShipping(order_id, data){
    //insert into shippings
    const result = await db.query(
      `INSERT INTO shippings (order_id, address, city, zip_code)
      VALUES ($1, $2, $3, $4)
      RETURNING id, order_id, address, city, zip_code`, 
      [ 
        order_id,
        data.address,
        data.city,
        data.zip_code
      ]
    );
    return result.rows[0];
  }

  /** add payments */
  static async addPayment(order_id, pay_ref){
    //insert payment info in payment tables
    const result = await db.query(
      `INSERT INTO payments (order_id, pay_ref)
      VALUES ($1, $2)
      RETURNING id, order_id, pay_ref`, 
      [ order_id, pay_ref ]
    );
    const payment = result.rows[0];
    if(!payment){
      throw new ExpressError(`There exists no order '${order_id}'`)
    }

    //update payment in orders table
    await db.query(
      `UPDATE orders
      SET is_paid = $1
      WHERE id = $2`,
      [true, order_id]
    );
    return payment;
  }

  /** find total amount */
  static async totalAmount(order_id){
    const totalRes = await db.query(
      `SELECT total_price 
      FROM orders
      WHERE id = $1`,
      [order_id]
    );
    return totalRes.rows[0];
  }
}

module.exports = Order;