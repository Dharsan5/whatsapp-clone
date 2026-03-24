const express = require("express");
const { body } = require("express-validator");
const { register, login, updateProfile } = require("../controllers/authController");
const auth = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

const router = express.Router();

// POST /api/auth/register
router.post(
  "/register",
  [
    body("username").trim().isLength({ min: 3 }),
    body("email").trim().isEmail(),
    body("phoneNumber").trim().notEmpty().withMessage("Phone number is required"),
    body("password").isLength({ min: 6 }),
  ],
  register
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("loginIdentifier").trim().notEmpty().withMessage("Email or Phone is required"),
    body("password").notEmpty(),
  ],
  login
);

// PUT /api/auth/profile — Update user profile (Onboarding)
router.put("/profile", auth, upload.single("avatar"), updateProfile);

module.exports = router;
