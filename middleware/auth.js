/** convienence middleware to handle common uth cases in routes */
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require ("../config");
const ExpressError = require("../helpers/expressError");
const Order = require("../models/order");

/** middleware to use when they must provide a valid token
 *  add user onto request as a convenience for view functions.
 *  if not, raises unauthorized.
 */
 function authRequired (req, res, next){
   try {
     const tokenStr = req.body._token || req.query._token;
     let token = jwt.verify(tokenStr, SECRET_KEY);
     res.locals.username = token.username;
     return next();
   } catch (err){
     return next(new ExpressError(`You must authenticate first`, 401));
   }
 }

 /** middleware to use when they must provide a valid token tha is an admin token
  *  add username onto req as a convenience for view functions.
  *  if not, raises unauthorized.
  */
 function adminRequired (req, res, next){
   try {
     const tokenStr = req.body._token;
     let token = jwt.verify(tokenStr, SECRET_KEY);
     res.locals.username = token.username;

     if(token.is_admin){
       return next();
     }
     throw new Error();
   } catch (err){
    return next(new ExpressError(`You must have an admin to access`, 401));
   }
 }

 /** middleware to use when they must provide a vlid token & be user matching
  *  username provided as route param.
  *  add username onto req as a convenience for view function
  *  if not, raises unauthorized.
  */
 function ensureCorrectUser (req, res, next){
   try {
     const tokenStr = req.body._token || req.query._token;
     let token = jwt.verify(tokenStr, SECRET_KEY);
     res.locals.username = token.username;

     if(token.username === req.params.username){
       return next();
     }
     throw new Error();
   } catch (err){
     return next(new ExpressError("Unauthorized", 401));
   }
 }


 async function ensureCorrectUserOrder (req, res, next){
  try {
    const tokenStr = req.body._token || req.query._token;
    let token = jwt.verify(tokenStr, SECRET_KEY);
    res.locals.username = token.username;

    let order = await Order.findOne(req.params.id);
    if(token.username === order.user.username){
      return next();
    }
    throw new Error();
  } catch (err){
    return next(new ExpressError("Unauthorized", 401));
  }
}

 module.exports = {
   authRequired,
   adminRequired,
   ensureCorrectUser,
   ensureCorrectUserOrder
 }