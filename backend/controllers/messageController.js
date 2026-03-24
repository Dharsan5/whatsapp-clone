const { validationResult } = require("express-validator");
const Message = require("../models/Message");
const User = require("../models/User");

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType, location } = req.body;
    const senderId = req.user.id;

    // Handle JSON data if sent as string via FormData
    let parsedLocation = null;
    if (location) {
      try {
        parsedLocation = typeof location === "string" ? JSON.parse(location) : location;
      } catch (e) {
        console.error("Location parse error", e);
      }
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    let mediaUrl = "";
    let fileName = "";
    let finalMessageType = messageType || "text";

    // If file uploaded to Cloudinary
    if (req.file) {
      mediaUrl = req.file.path;
      fileName = req.file.originalname;

      // Determine message type from file mimetype if not explicitly provided
      if (!messageType || messageType === "text") {
        if (req.file.mimetype.startsWith("image")) finalMessageType = "image";
        else if (req.file.mimetype.startsWith("video")) finalMessageType = "video";
        else finalMessageType = "document";
      }
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content || "",
      messageType: finalMessageType,
      mediaUrl,
      fileName,
      location: parsedLocation,
    });

    const populatedMessage = await message.populate([
      { path: "sender", select: "username avatar" },
      { path: "receiver", select: "username avatar" },
    ]);

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get messages between users
const getMessages = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    })
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get last message per conversation
const getLastMessages = async (req, res) => {
  try {
    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", req.user._id] }, "$receiver", "$sender"],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$lastMessage" } },
    ]);

    const populated = await Message.populate(lastMessages, [
      { path: "sender", select: "username avatar" },
      { path: "receiver", select: "username avatar" },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { sendMessage, getMessages, getLastMessages };
