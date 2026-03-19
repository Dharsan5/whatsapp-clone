const { Server } = require("socket.io");

let io;

// Map of userId → socketId
// When user "john" connects, we store: { "john_id_123": "socket_abc" }
// This lets us send messages directly to a specific user
const onlineUsers = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // When a user logs in, they emit "user_online" with their userId
    // We store their socketId so we can send them messages later
    socket.on("user_online", (userId) => {
      onlineUsers.set(userId, socket.id);
      // Broadcast the updated online users list to everyone
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });

    // When a user sends a message from the frontend
    socket.on("send_message", (message) => {
      const receiverSocketId = onlineUsers.get(message.receiver._id);

      // If the receiver is online, send the message directly to them
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", message);
      }
    });

    // When a user disconnects (closes browser/tab)
    socket.on("disconnect", () => {
      // Find and remove the disconnected user from onlineUsers
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      // Update everyone with new online users list
      io.emit("online_users", Array.from(onlineUsers.keys()));
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };
