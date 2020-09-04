/** routes for authenticatin */
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const createToken = require("../helpers/createToken");

router.post("/login", async function(req, res, next){
  try {
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;