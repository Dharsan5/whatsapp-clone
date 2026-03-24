const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaUrl: {
      type: String, // Cloudinary URL
      required: false,
    },
    mediaType: {
      type: String, // "image" or "video"
      enum: ["image", "video"],
      required: false,
    },
    content: {
      type: String, // Optional text or emoji
      trim: true,
      required: false,
    },
    // Status is active for 24 hours
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 24 * 60 * 60 * 1000), // Current time + 24h
      index: { expires: 0 }, // Automatically delete document after expiresAt
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Status", statusSchema);
