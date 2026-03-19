const express = require("express");
const { getUsers } = require("../controllers/userController");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/users
// auth middleware runs first (checks JWT token), then getUsers runs
router.get("/", auth, getUsers);

module.exports = router;
