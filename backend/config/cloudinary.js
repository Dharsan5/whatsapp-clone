const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "whatsapp_clone_status",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip"],
    resource_type: "auto",
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
