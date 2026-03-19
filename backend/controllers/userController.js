const User = require("../models/User");

// @desc    Get all users except the logged-in user
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    // Find all users EXCEPT myself
    // select("-password") = return everything EXCEPT the password field
    const users = await User.find({ _id: { $ne: req.user.id } }).select(
      "-password"
    );

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getUsers };
