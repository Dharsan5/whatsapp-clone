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
      required: false,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "document", "location"],
      default: "text",
    },
    mediaUrl: {
      type: String,
      required: false,
    },
    fileName: {
      type: String,
      required: false,
    },
    location: {
      latitude: Number,
      longitude: Number,
      label: String,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // For Status Replies
    repliedStatus: {
      mediaUrl: String,
      mediaType: String, // "image", "video", "text"
      caption: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
