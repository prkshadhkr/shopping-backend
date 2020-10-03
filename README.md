### Links
web: https://shop-only.herokuapp.com/ <br>
frontend: https://github.com/prkshadhkr/shopping-frontend <br>
Stripe API: https://stripe.com/docs/payments/integration-builder

### Developers:
  1. Clone the project
  2. Create **secret.js** in root directory.
  3. In secret.js add following:<br>
     _const STRIPE_SECRET_KEY = YOUR_STRIPE_KEY <br>
     export { STRIPE_SECRET_KEY }_ <br>
     (Note: visit https://stripe.com/ to get YOUR_STRIPE_KEY)<br>

### Improvements:
  1. Make separate Cart table to track items update in cart whenever user adds or removes the products.
  2. Updtae database only after payment is completed.
  
