const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  register,
  login,
  refresh,
  me,
  logout,
  lockVault,
  unlockVault,
  setPrivateMode
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/me", protect, me);
router.post("/logout", protect, logout);
router.post("/vault/lock", protect, lockVault);
router.post("/vault/unlock", protect, unlockVault);
router.patch("/private-mode", protect, setPrivateMode);

module.exports = router;


