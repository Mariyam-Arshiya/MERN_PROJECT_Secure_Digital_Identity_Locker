const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.send("User Registered Successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Registration Error");
  }
});

// LOGIN
router.post(
  "/login",
  passport.authenticate("local"),
  (req, res) => {
    res.json({
      message: "Login Successful",
      user: req.user
    });
  }
);

// LOGOUT
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.send("Logout Successful");
  });
});

module.exports = router;


