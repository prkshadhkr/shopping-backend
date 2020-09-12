const express = require("express");
const Order = require("../models/order");
const { 
    ensureCorrectUserOrder, 
  } = require("../middleware/auth");
const { STRIPE_SECRET_KEY } = require("../secret");
const stripe = require("stripe")(STRIPE_SECRET_KEY);
const router = express.Router();

/**post request for stripe webhook */
router.post('/webhook', 
  async function (req, res) {
    let event;
    try {
      event = req.body;
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
    const orderId = event.data.object.metadata.order_id;

    switch (event.type) {
      //if payment is succeeded update the order table with payment info
      case 'payment_intent.succeeded':
        await Order.addPayment( orderId, event.id); 
        break;
      
      //could be useful if billiing info needed
      case 'payment_method.attached':
        console.log('PAYMENT METHOD IS ATTACHED');
        break;
        
      default:
        // Unexpected event type  
    }
  // Return a response to acknowledge receipt of the event
  res.json({received: true});
});


/** POST /{payment}  => {payment : payment }*/
router.post("/", ensureCorrectUserOrder, async function(req, res, next){
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
      currency: "usd",
      //metadata for order_id to update database
      metadata: {'order_id': orderId} 
    });
    res.json({
      clientSecret: paymentIntent.client_secret
    });
    // console.log('PaymentIntent', paymentIntent);
  } catch(err) {
    return next(err);
  }
})

module.exports = router;