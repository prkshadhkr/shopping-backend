/* shared config. for application, can be required in many places */

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "very-secret-key-do-not-tell";
const PORT = +process.env.PORT || 3001;

//database is:
//
// -on Heroku, get from env var DATABASE_URL
// -in testing, 'shopping_test'
// -else: 'shopping'


let DB_URI;

if (process.env.NODE_ENV === "test"){
  DB_URI = "shopping_test";
} else {
  DB_URI = process.env.DATABASE_URL || "shopping";
}

const BCRYPT_WORK_FACTOR = 10;
const SALES_TAX = 0.07;
const SHIPPING_RATE = 0.05;

module.exports = {
  SECRET_KEY,
  PORT,
  DB_URI,
  BCRYPT_WORK_FACTOR,
  SALES_TAX,
  SHIPPING_RATE
}