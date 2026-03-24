const Status = require("../models/Status");
const User = require("../models/User");

// Create a new status (media + text)
const createStatus = async (req, res) => {
  try {
    const { content } = req.body;
    const senderId = req.user.id; // From auth middleware

    let mediaUrl = "";
    let mediaType = "";

    // If file uploaded to Cloudinary
    if (req.file) {
      mediaUrl = req.file.path; // Cloudinary returns the full URL in .path
      // Multer-storage-cloudinary or the file object doesn't always have a direct .resource_type
      // but we can check mimetype or just get it from the file object
      const isVideo = req.file.mimetype.startsWith("video");
      mediaType = isVideo ? "video" : "image";
    }

    // Must have either media or text (or both)
    if (!mediaUrl && !content) {
      return res.status(400).json({ message: "Status must include media or text content" });
    }

    const status = await Status.create({
      sender: senderId,
      mediaUrl: mediaUrl || "",
      mediaType: mediaType || "",
      content: content || "",
    });

    const populatedStatus = await status.populate("sender", "username avatar");

    res.status(201).json(populatedStatus);
  } catch (error) {
    res.status(500).json({ message: "Failed to create status", error: error.message });
  }
};

// Get all recent statuses from ALL users (public list)
const getStatuses = async (req, res) => {
  try {
    // Find statuses that haven't expired (MongoDB handles deletion automatically via TTL, but we query anyway)
    const statuses = await Status.find({ expiresAt: { $gt: new Date() } })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 });

    // In WhatsApp, we group statuses by user. Let's do that.
    // { userId: { user, statuses: [...] } }
    const grouped = statuses.reduce((acc, current) => {
      const senderId = current.sender._id.toString();
      if (!acc[senderId]) {
        acc[senderId] = {
          user: current.sender,
          statuses: [],
        };
      }
      acc[senderId].statuses.push(current);
      return acc;
    }, {});

    // Convert back to array: [{ user, statuses: [...] }, ...]
    const result = Object.values(grouped);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch statuses", error: error.message });
  }
};

module.exports = { createStatus, getStatuses };
