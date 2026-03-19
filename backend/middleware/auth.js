const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Get token from the Authorization header
    // Frontend sends: { Authorization: "Bearer eyJhbGciOi..." }
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Extract the token (remove "Bearer " prefix)
    const token = authHeader.split(" ")[1];

    // Verify the token — jwt.verify() decodes it and checks if it's valid
    // If someone tampered with it or it's expired, this throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user to the request object (so controllers can access req.user)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next(); // Token is valid — proceed to the controller
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = auth;
