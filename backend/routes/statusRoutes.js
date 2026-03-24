const express = require("express");
const { createStatus, getStatuses } = require("../controllers/statusController");
const auth = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

const router = express.Router();

// POST /api/status — Add a new status (supports media + text)
// Content-Type must be multipart/form-data
router.post("/", auth, upload.single("media"), createStatus);

// GET /api/status — Get all recent statuses grouped by user
router.get("/", auth, getStatuses);

module.exports = router;
