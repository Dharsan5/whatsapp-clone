const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: false, // Optional if it's purely media/location
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "document", "location"],
      default: "text",
    },
    mediaUrl: {
      type: String, // Cloudinary URL or file link
      required: false,
    },
    fileName: {
      type: String, // Original filename for documents
      required: false,
    },
    location: {
      latitude: Number,
      longitude: Number,
      label: String, // Optional name for location (e.g., "Starbucks")
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
