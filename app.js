/*** express app: shopping ***/

const express = require("express");
const cors = require("cors");
const ExpressError = require("./helpers/expressError");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");


/** middleware */
const morgan = require('morgan');

const app = express();

// added for stripe application
app.use(express.static("."));

// for json data:
app.use(express.json());

// allowing No 'Access-Control-Allow-Origin' 
app.use(cors());

// add logging system:
app.use(morgan('tiny'));

/** routes */
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/users", userRoutes);
app.use("/", authRoutes);





/*** 404 handler: ***/
app.use(function (req, res, next){
  const err = new ExpressError("Not Found", 404);

  /*** passing error to the next piece of middleware ***/
  return next(err);
})

/*** general Error handler: ***/
app.use(function (err, req, res, next){
  res.status(err.status || 500);
  console.error(err.stack);

  return res.json({
    status: err.status,
    message: err.message
  })
});

module.exports = app;


