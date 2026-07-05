const express = require("express");
const router = express.Router();
const User = require("../models/user");
const protect = require("../middleware/authMiddleware");

router.use(protect);

// CREATE USER
router.post("/add", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.send("User Added");
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL USERS  (THIS IS THE ONLY ONE YOU NEED)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshTokenHash");
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -refreshTokenHash");
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE USER
router.put("/update/:id", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.send("User Updated");
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE USER
router.delete("/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.send("User Deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
