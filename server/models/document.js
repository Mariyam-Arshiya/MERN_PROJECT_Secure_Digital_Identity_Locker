const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: {
      type: String,
      default: ""
    },
    content: {
      type: String,
      default: ""
    },
    notes: {
      type: String,
      default: ""
    },
    category: {
      type: String,
      default: "Personal"
    },
    tags: {
      type: [String],
      default: []
    },
    expiresAt: {
      type: Date,
      default: null,
      index: {
        expireAfterSeconds: 0,
        partialFilterExpression: {
          expiresAt: {
            $type: "date"
          }
        }
      }
    },
    searchText: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

documentSchema.index({
  title: "text",
  type: "text",
  category: "text",
  tags: "text",
  searchText: "text"
});

module.exports = mongoose.models.Document || mongoose.model("Document", documentSchema);
