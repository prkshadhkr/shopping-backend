DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS shippings CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN default FALSE NOT NULL
);

CREATE TABLE products(
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  brand TEXT NOT NULL,
  price DECIMAL(13, 2) NOT NULL, 
  category TEXT,
  count_in_stock INTEGER NOT NULL,
  description TEXT,
  rating DECIMAL(13, 1) default 0.0,
  num_reviews INTEGER default 0
);

CREATE TABLE reviews(
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  rating INTEGER,
  comment TEXT
);

CREATE TABLE orders(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  price DECIMAL(13, 2) default 0.00,
  tax_price DECIMAL(13, 2) default 0.00,
  shipping_price DECIMAL(13, 2) default 0.00,
  total_price DECIMAL(13, 2) default 0.00,
  is_paid BOOLEAN default FALSE,
  is_delivered BOOLEAN default FALSE
);

CREATE TABLE shippings(
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  zip_code TEXT NOT NULL
);

CREATE TABLE payments(
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  pay_ref TEXT NOT NULL
);

CREATE TABLE order_items(
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  qty INTEGER default 0,
  price DECIMAL(13, 2) default 0.00,
  PRIMARY KEY(order_id, product_id)
);