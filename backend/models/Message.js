const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,  // References a User document
      ref: "User",                            // Which model to reference
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
  },
  {
    timestamps: true,  // createdAt = when message was sent
  }
);

module.exports = mongoose.model("Message", messageSchema);
