const express = require("express");
const router = express.Router();

// Protected Dashboard
router.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      message: "Welcome to Dashboard",
      user: req.user
    });
  } else {
    res.status(401).send("Please Login First");
  }
});

module.exports = router;