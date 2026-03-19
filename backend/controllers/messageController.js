const { validationResult } = require("express-validator");
const Message = require("../models/Message");
const User = require("../models/User");

// @desc    Send a message
// @route   POST /api/messages
// @access  Private (must be logged in)
const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId, content } = req.body;
    const senderId = req.user.id; // Comes from auth middleware (JWT decoded)

    // Make sure receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Can't send a message to yourself
    if (senderId === receiverId) {
      return res.status(400).json({ message: "Cannot send message to yourself" });
    }

    // Create and save the message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    // Populate sender & receiver info (replace IDs with actual user data)
    // Before populate: { sender: "64abc...", receiver: "64def..." }
    // After populate:  { sender: { _id: "64abc", username: "john" }, ... }
    const populatedMessage = await message.populate([
      { path: "sender", select: "username avatar" },
      { path: "receiver", select: "username avatar" },
    ]);

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get messages between logged-in user and another user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherUserId = req.params.userId;

    // Validate that the other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all messages between these two users (in both directions)
    // Either: I sent to them  OR  they sent to me
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    })
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar")
      .sort({ createdAt: 1 }); // 1 = oldest first (chronological order)

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get last message for each conversation
// @route   GET /api/messages/last-messages
// @access  Private
const getLastMessages = async (req, res) => {
  try {
    const myId = req.user.id;

    // Aggregation pipeline — groups messages by conversation and picks the latest
    const lastMessages = await Message.aggregate([
      {
        // Find all messages where I'm either sender or receiver
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id },
          ],
        },
      },
      {
        // Sort by newest first
        $sort: { createdAt: -1 },
      },
      {
        // Group by conversation partner and pick the first (newest) message
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", req.user._id] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$lastMessage" },
      },
    ]);

    // Populate sender and receiver info
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
