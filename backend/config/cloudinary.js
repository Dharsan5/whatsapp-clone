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
    folder: "whatsapp_clone_status", // Folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov"],
    resource_type: "auto", // Automatically detect if it's an image or video
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
