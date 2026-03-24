const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Register a new user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, phoneNumber, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phoneNumber }],
    });

    if (existingUser) {
      let field = "Account";
      if (existingUser.email === email) field = "Email";
      else if (existingUser.username === username) field = "Username";
      else if (existingUser.phoneNumber === phoneNumber) field = "Phone number";
      
      return res.status(400).json({ message: `${field} already registered` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      isOnboarded: user.isOnboarded,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login user
const login = async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body; // Can be email or phone

    // Find user by email OR phone number
    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { phoneNumber: loginIdentifier }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      isOnboarded: user.isOnboarded,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user profile (Onboarding)
const updateProfile = async (req, res) => {
  try {
    const { fullName, about } = req.body;
    const userId = req.user.id;

    let avatarUrl = "";
    if (req.file) {
      avatarUrl = req.file.path; // Cloudinary URL
    }

    const updateData = {
      fullName: fullName || "",
      about: about || "Hey there! I am using WhatsApp.",
      isOnboarded: true,
    };

    if (avatarUrl) updateData.avatar = avatarUrl;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

module.exports = { register, login, updateProfile };
