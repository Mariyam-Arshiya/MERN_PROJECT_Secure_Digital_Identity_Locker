const mongoose = require("mongoose");

const shareLinkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: {
        expireAfterSeconds: 0
      }
    },
    used: {
      type: Boolean,
      default: false
    },
    maxViews: {
      type: Number,
      default: 1
    },
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.ShareLink || mongoose.model("ShareLink", shareLinkSchema);
