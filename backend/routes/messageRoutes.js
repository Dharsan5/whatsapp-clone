const express = require("express");
const { body } = require("express-validator");
const { sendMessage, getMessages } = require("../controllers/messageController");
const auth = require("../middleware/auth");

const router = express.Router();

// POST /api/messages — send a message
router.post(
  "/",
  auth,
  [
    body("receiverId")
      .notEmpty()
      .withMessage("Receiver ID is required"),
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Message content cannot be empty"),
  ],
  sendMessage
);

// GET /api/messages/:userId — get chat history with a specific user
router.get("/:userId", auth, getMessages);

module.exports = router;
