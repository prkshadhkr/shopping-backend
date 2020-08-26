const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const { validate } = require("jsonschema");
const{ userNewSchema, userUpdateSchema } = require("../schemas");
const createToken = require("../helpers/createToken");
const {adminRequired, ensureCorrectUser } = require("../middleware/auth");

const router = express.Router();

/** GET/ => { users: [user, ...]} */
router.get("/", adminRequired, async function(req, res, next){
  try {
    const users = await User.findAll();
    return res.json({ users })
  } catch(err){
    return next(err);
  }
})

/** GET/[username] => {user: user} */
router.get("/:username", ensureCorrectUser, async function(req, res, next){
  try {
    const user = await User.findOne(req.params.username);
    return res.json({ user });
  } catch (err){
    return next(err);
  }
})

/** POST/{ userdata } => { token: token } */
router.post("/", async function(req, res, next){
  try {
      let checkSchema = validate(req.body, userNewSchema);

      if (!checkSchema.valid){
        throw new ExpressError(checkSchema.errors.map(e => e.stack ), 400);
      }

      const newUser = await User.register(req.body);
      const token = createToken(newUser);
      return res.status(201).json({ token });
  } catch (err){
    return next(err);
  }
})

/** PATCH /{userData} => {user: updateUser} */
router.patch("/:username", ensureCorrectUser, async function(req, res, next){
  try {
    if("username" in req.body || "is_admin" in req.body){
      throw new ExpressError(
        `You are not allowed to change username or is_admin properties`,
        400
      )
    }

    const validateUser = validate(req.body, userUpdateSchema);
    if(!validateUser.valid){
      throw new ExpressError(validateUser.errors.map(e => e.stack), 400)
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err){
    return next (err);
  }
})

/** DELETE /[username] => { message: "user deleted" } */
router.delete("/:username", ensureCorrectUser, async function(req, res, next){
  try {
    await User.remove(req.params.username);
    return res.json({ message: "User deleted" });
  } catch(err){
    return next(err);
  }
})

module.exports = router;