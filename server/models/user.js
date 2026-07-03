const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

// ✅ Prevent overwrite error
module.exports = mongoose.models.User || mongoose.model("User", userSchema);