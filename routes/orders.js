const express = require("express");
const ExpressError = require("../helpers/expressError");
const Order = require("../models/order");
const { validate } = require("jsonschema");
const{ orderNewSchema } = require("../schemas");
const { 
  adminRequired,
  authRequired, 
  ensureCorrectUserOrder, 
  ensureCorrectUser
} = require("../middleware/auth");

//for stripe payment
const { STRIPE_SECRET_KEY } = require("../secret");
const stripe = require("stripe")(STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');

const router = express.Router();

/** GET/ => { orders: [order, ...]} */
router.get("/", adminRequired, async function(req, res, next){
  try {
    const orders = await Order.findAll(req.query);
    return res.json({ orders })
  } catch(err){
    return next(err);
  }
});

// /** GET/[name] => {order: order} */
// router.get("/:id", authRequired, ensureCorrectUserOrder, async function(req, res, next){
//   try {
//     const order = await Order.findOne(req.params.id);
//     return res.json({ order });
//   } catch (err){
//     return next(err);
//   }
// });

/** GET/[name] => {order: order} */
router.get("/:username", ensureCorrectUser, async function(req, res, next){
  try {
    const orders = await Order.findOrderByUser(req.params.username);
    return res.json({ orders });
  } catch (err){
    return next(err);
  }
});

/** POST/{ orderData } => { token: token } */
router.post("/", authRequired, async function(req, res, next){
  try {
      let checkSchema = validate(req.body, orderNewSchema);

      if (!checkSchema.valid){
        throw new ExpressError(checkSchema.errors.map(e => e.stack ), 400);
      }
      // res.locals.username 
      const newOrder = await Order.create(res.locals.username);
      // get updatedOrder from order id just created and product info from request body
      const order = await Order.updateOrderItems(newOrder.id, req.body )
      return res.status(201).json({ order });
  } catch (err){
    return next(err);
  }
});

/** DELETE /[id] => { orders: "order deleted" } */
router.delete("/:id", adminRequired, async function(req, res, next){
  try {
    await Order.remove(req.params.id);
    return res.json({ message: "Order deleted" });
  } catch(err){
    return next(err);
  }
})

/** POST /{shipping}  => {shipping : shipping }*/
router.post("/shipping", ensureCorrectUserOrder, async function(req, res, next){
  try {
    const shipping = await Order.addShipping(
      req.body.order_id,
      req.body
    );

  return res.json({ shipping });
  } catch(err) {
    return next(err);
  }
})

router.post('/webhook', 
  bodyParser.raw({type: 'application/json'}),
  async function (request, response) {
    let event;

    try {
      event = JSON.parse(request.body);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('************ test ***********');
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
      
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        // await Order.addPayment( orderId, paymentIntent); 
        console.log('before switch !!!!!!!!!!!', paymentIntent);

        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      // ... handle other event types
      default:
        // Unexpected event type
        return response.status(400).end();
    }
  // Return a response to acknowledge receipt of the event
  response.json({received: true});
});


/** POST /{payment}  => {payment : payment }*/
router.post("/payment", ensureCorrectUserOrder, async function(req, res, next){
  try {
    const orderId = req.body.order_id;
    const customer = await stripe.customers.create();
    const { total_price } = await Order.totalAmount( orderId );
    const totalPrice = 100 * Number.parseFloat(total_price);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customer.id,
      setup_future_usage: 'off_session',
      amount: totalPrice,
      currency: "usd"
    });
    res.json({
      clientSecret: paymentIntent.client_secret
    });
    console.log("---------->>>>> paymentIntent : ", paymentIntent);
    // await Order.addPayment( orderId, paymentIntent.client_secret); 
  } catch(err) {
    return next(err);
  }
})


module.exports = router;







  /** just following would post payement intent */
  // try {
  //   const orderId = req.body.order_id;
  //   const { total_price } = await Order.totalAmount( orderId );
  //   const totalPrice = 100 * Number.parseFloat(total_price);
  //   const paymentIntent = await stripe.paymentIntents.create({
  //     amount: totalPrice,
  //     currency: "usd"
  //   });
  //   const pIntent = paymentIntent.client_secret;
  //   res.send ({ clientSecret: pIntent });
  //   await Order.addPayment( orderId, pIntent); 
  // } catch(err) {
  //   return next(err);
  // }