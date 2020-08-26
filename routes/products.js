const express = require("express");
const ExpressError = require("../helpers/expressError");
const Product = require("../models/product");
const { validate } = require("jsonschema");
const{ productNewSchema, productUpdateSchema } = require("../schemas");
const { adminRequired, authRequired } = require("../middleware/auth");

const router = express.Router();

/** GET/ => { products: [product, ...]} */
router.get("/", async function(req, res, next){
  try {
    const products = await Product.findAll(req.query);
    return res.json({ products })
  } catch(err){
    return next(err);
  }
})

/** GET/[name] => {product: product} */
router.get("/:id", authRequired, async function(req, res, next){
  try {
    const product = await Product.findOne(req.params.id);
    return res.json({ product });
  } catch (err){
    return next(err);
  }
})

/** POST/{ productData } => { token: token } */
router.post("/", adminRequired, async function(req, res, next){
  try {
      let checkSchema = validate(req.body, productNewSchema);

      if (!checkSchema.valid){
        throw new ExpressError(checkSchema.errors.map(e => e.stack ), 400);
      }

      const newProduct = await Product.create(req.body);
      return res.status(201).json({ newProduct });
  } catch (err){
    return next(err);
  }
})

/** PATCH /{productData} => {product: updateProduct} */
router.patch("/:id", adminRequired, async function(req, res, next){
  try {
    if("id" in req.body){
      throw new ExpressError(
        `You are not allowed to change the product id`,
        400
      )
    }

    const validateUser = validate(req.body, productUpdateSchema);
    if(!validateUser.valid){
      throw new ExpressError(validateUser.errors.map(e => e.stack), 400)
    }

    const product = await Product.update(req.params.id, req.body);
    return res.json({ product });
  } catch (err){
    return next (err);
  }
});

/** DELETE /[name] => { products: "product deleted" } */
router.delete("/:id", adminRequired, async function(req, res, next){
  try {
    await Product.remove(req.params.id);
    return res.json({ message: "Product deleted" });
  } catch(err){
    return next(err);
  }
})

/** POST /{reviews}  => {product : reviews }*/
router.post("/:id/reviews", authRequired, async function(req, res, next){
  try {
    const review = await Product.addReview(
      req.params.id,
      req.body
    );

  return res.json({ review });
  } catch(err) {
    return next(err);
  }
})

/** DELETE / [id] => {reviews: "review deleted"} */
router.delete("/:id/reviews/:rId", adminRequired, async function(req, res, next){
  try {
    await Product.removeReview(req.params.id, req.params.rId);
    return res.json({ message: "Review deleted"});
  } catch(err){
    return next(err);
  }
})

module.exports = router;