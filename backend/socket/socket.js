const { Server } = require("socket.io");
const Message = require("../models/Message");

let io;

// Map of userId → socketId
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

    // User comes online
    socket.on("user_online", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });

    // Sender sends a message — forward to receiver and mark delivered if online
    socket.on("send_message", async (message) => {
      const receiverSocketId = onlineUsers.get(message.receiver._id);
      if (receiverSocketId) {
        // Receiver is online → mark as delivered in DB
        try {
          await Message.findByIdAndUpdate(message._id, { delivered: true });
        } catch (e) { console.error("deliver update error:", e); }
        const deliveredMsg = { ...message, delivered: true };
        io.to(receiverSocketId).emit("receive_message", deliveredMsg);
        // Tell the sender their message was delivered
        socket.emit("message_delivered", { messageId: message._id });
      }
    });

    // Receiver opens a chat → mark all unread messages from sender as read
    socket.on("messages_seen", async ({ viewerId, senderId }) => {
      try {
        await Message.updateMany(
          { sender: senderId, receiver: viewerId, read: false },
          { $set: { read: true, delivered: true } }
        );
        // Notify the original sender that their messages are read
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messages_read", { by: viewerId, from: senderId });
        }
      } catch (e) { console.error("seen update error:", e); }
    });

    // Typing indicators
    socket.on("typing", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit("user_typing", { userId: senderId });
    });

    socket.on("stop_typing", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit("user_stop_typing", { userId: senderId });
    });

    // Disconnect
    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) { onlineUsers.delete(userId); break; }
      }
      io.emit("online_users", Array.from(onlineUsers.keys()));
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};

module.exports = { initSocket, getIO };

