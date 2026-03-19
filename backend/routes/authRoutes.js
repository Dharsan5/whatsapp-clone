const express = require("express");
const { body } = require("express-validator");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/register
// body() validators run BEFORE the controller — they check input
router.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  register
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email"),
    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  login
);

module.exports = router;
