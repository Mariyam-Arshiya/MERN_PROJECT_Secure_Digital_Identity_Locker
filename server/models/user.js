const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  refreshTokenHash: {
    type: String,
    default: ""
  },
  vaultLocked: {
    type: Boolean,
    default: false
  },
  privateMode: {
    type: Boolean,
    default: false
  },
  knownLogins: [
    {
      ipAddress: String,
      userAgent: String,
      lastSeen: Date
    }
  ],
  suspiciousLogins: [
    {
      ipAddress: String,
      userAgent: String,
      detectedAt: Date
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
