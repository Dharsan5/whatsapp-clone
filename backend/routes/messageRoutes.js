const express = require("express");
const { body } = require("express-validator");
const { 
  sendMessage, 
  getMessages, 
  getLastMessages,
  getGlobalMedia 
} = require("../controllers/messageController");
const auth = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

const router = express.Router();

// GET /api/messages/global-media — get all media from all chats
router.get("/global-media", auth, getGlobalMedia);

// GET /api/messages/last-messages — get last message per conversation
router.get("/last-messages", auth, getLastMessages);

// POST /api/messages — send a message (supports text, media, docs, location)
router.post(
  "/",
  auth,
  upload.single("media"), 
  [
    body("receiverId").notEmpty().withMessage("Receiver ID is required"),
  ],
  sendMessage
);

// GET /api/messages/:userId — get chat history
router.get("/:userId", auth, getMessages);

module.exports = router;
