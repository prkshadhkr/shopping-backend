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


-- --Lets' add some data to the database:
-- --
-- -- |   Username:  |   password:    |   is_admin  |
-- ---|--------------|----------------|-------------|
-- -- |   test       |   testuser     |   false     |
-- -- |   dog        |   dogman       |   true      |
-- -- |   admin      |   admin        |   true      |
-- --
-- -- Make sure change your password using frontend.

-- INSERT INTO users 
-- (username, first_name, last_name, email, password, is_admin ) VALUES 
-- ('test', 'test', 'test', 'test@gmail.com', '$2b$10$pHcDK9ZEPdMqxU34J2cHr.raS9eLPBleIpdozBFaM7pdoC62d/lW.', false),
-- ('dog', 'dog', 'wolf', 'dog@gmail.com', '$2b$10$WVOrlgFthgw.QKmrrewc1uAoicfbbAVlpNjYTygXfMRroOxcIHG1G', true ),
-- ('admin', 'admin', 'admin', 'admin@gmail.com', '$2b$10$XzMduu4u9r8eoX/A82LcH.9yLVJiITFmHtX556.GKFNgIgP0lkEi.', true);

-- --let's add some products to start up with
-- INSERT INTO products (
--   name,
--   image,
--   brand,
--   price, 
--   category,
--   count_in_stock,
--   description
-- ) VALUES 
-- (
--   'Apple Watch',
--   'https://webobjects2.cdw.com/is/image/'
--   'CDW/5749422?wid=1142&hei=818&resMode=bilin&fit=fit,1',
--   'Apple',
--   649.00,
--   'Accessories',
--   50,
--   'Gold Stainless Steel Case with Sport Band\n'
-- ),
-- (
--   'Bottle',
--   'https://www.hydroflask.com/media/catalog/product/'
--   'cache/9177cfe059281270017bc29637323e6d/w/3/w32sw2-fog.jpg',
--   'Hydroflask',
--   49.95,
--   'Sports',
--   50,
--   'Insulated water bottle'
-- ),
-- (
--   'Iphone',
--   'https://i.insider.com'
--   '/5df90ed3fd9db2498e7aacd1?width=1100&format=jpeg&auto=webp',
--   'Apple',
--   1000.00,
--   'Electronics',
--   50,
--   'One of the best phone in market'
-- ),
-- (
--   'Midi shirt',
--   'https://ak1.ostkcdn.com/images/products/is/images/direct/'
--   '39f991b0a221bd1ddd17f8c695f8b4ce6258d7b4/Women%27s-Business-C'
--   'asual-Work-Printed-A-line-Midi-Shirt-Dress.jpg',
--   'Unique bargains',
--   42.49,
--   'Dress',
--   700,
--   'Summer wear'
-- ),
-- (
--   'Sandals',
--   'https://slimages.macys.com/is/image/MCY/products/5/optimized/8517045_f'
--   'px.tif?op_sharpen=1&wid=1230&hei=1500&fit=fit,1&$filterxlrg$',
--   'Naturalizer',
--   39.99,
--   'Sandals',
--   50,
--   'Taimi dress sandals'
-- ),
-- (
--   'Shoes',
--   'https://c.static-nike.com/a/images/t_PDP_864_v1/f_auto,b_rgb:f5f5f5/'
--   'awjogtdnqxniqqk0wpgf/air-max-270-mens-shoe-qVk0Vw.jpg',
--   'Nike',
--   150.00,
--   'Sports',
--   100,
--   'Great Pair of shoes'
-- ), 
-- (
--   'Soccer ball',
--   'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,b_rgb:f5f5f5/'
--   '9cd877c3-1849-40a8-89b7-66619d702ca5/premier-league-flight-soccer-ball-0QpPjJ.jpg',
--   'Nike',
--   160.00,
--   'Sports',
--   100,
--   'Authentic premier league soccer ball'
-- ),
-- (
--   'Bag',
--   'https://slimages.macys.com/is/image/MCY/products/1/optimized/'
--   '17646101_fpx.tif?op_sharpen=1&wid=1230&hei=1500&fit=fit,1&$filterxlrg$',
--   'DKNY',
--   168.00,
--   'Accessories',
--   100,
--   'DKNY Lola crossbody'
-- ),
-- (
--   'Cap',
--   'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,b_rgb:f5f5f5/'
--   '969f8c74-c3ae-4c50-92f6-0324de9bf7bd/aerobill-classic99-golf-hat-nWnHv4.jpg',
--   'Nike',
--   20.00,
--   'Sports',
--   100,
--   'Cap for outdoor running'
-- ),
-- (
--   'Headphone',
--   'https://assets.bose.com/content/dam/Bose_DAM/Web/consumer_electronics/global/'
--   'products/headphones/qc35_ii/product_silo_images/qc35_ii_silver_EC_hero.psd/'
--   'jcr:content/renditions/cq5dam.web.1000.1000.png',
--   'Bose',
--   279.00,
--   'Electronics',
--   50,
--   'Bose QuietComfort 35 II Wireless Bluetooth Headphone Noise-Cancelling,' 
--   ' with Alexa voice control - silver'
-- ),
-- (
--   'Hoodies',
--   'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,b_rgb:f5f5f5/'
--   '8e982430-ef01-49a3-a9b5-c0f524d4dc49/'
--   'breathe-big-kids-boys-long-sleeve-hooded-training-top-qCHdgL.jpg',
--   'Nike',
--   19.97,
--   'Sports',
--   150,
--   'Hoodies for fall'
-- ),
-- (
--   'TV',
--   'https://images-na.ssl-images-amazon.com/images/I/71RiQZ0J2SL._AC_SL1000_.jpg',
--   'Samsung',
--   689.99,
--   'Electronics',
--   160,
--   'Samsung Crystal UHD TU-8000 Series'
-- );