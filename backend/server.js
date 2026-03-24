const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { initSocket } = require("./socket/socket");

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Create HTTP server (needed for Socket.IO — it can't work with Express alone)
const server = http.createServer(app);

// Initialize Socket.IO on the same server
initSocket(server);

// --- MIDDLEWARE ---
// cors() — allows frontend (port 3000) to make requests to backend (port 5000)
// Without this, browser blocks the request (security feature called "Same-Origin Policy")
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// express.json() — parses JSON request bodies
// Without this, req.body would be undefined when frontend sends JSON data
app.use(express.json());

// --- ROUTES ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/status", require("./routes/statusRoutes"));

// Health check route — useful to verify the server is running
app.get("/", (req, res) => {
  res.json({ message: "WhatsApp Clone API is running" });
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start the server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
