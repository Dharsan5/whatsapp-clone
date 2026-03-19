import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./ChatWindow.css";

const ChatWindow = ({ selectedUser, messages, setMessages, socket }) => {
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();
  const messagesEndRef = useRef(null); // Reference to the bottom of messages list

  // Auto-scroll to the latest message whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message handler
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return; // Don't send empty messages

    try {
      // 1. Save message to database via API
      const res = await api.post("/messages", {
        receiverId: selectedUser._id,
        content: newMessage.trim(),
      });

      // 2. Add message to local state (so it appears immediately for sender)
      setMessages((prev) => [...prev, res.data]);

      // 3. Emit via Socket.IO (so receiver gets it instantly)
      if (socket) {
        socket.emit("send_message", res.data);
      }

      // 4. Clear the input field
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Format timestamp — "2:30 PM"
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // If no user is selected, show a welcome screen
  if (!selectedUser) {
    return (
      <div className="chat-window empty">
        <div className="empty-chat">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            className="empty-logo"
          />
          <h2>WhatsApp Web</h2>
          <p>Select a user to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Chat header — shows selected user's name */}
      <div className="chat-header">
        <div className="chat-header-avatar">
          {selectedUser.username.charAt(0).toUpperCase()}
        </div>
        <div className="chat-header-info">
          <div className="chat-header-name">{selectedUser.username}</div>
        </div>
      </div>

      {/* Messages area */}
      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message ${
              msg.sender._id === user._id ? "sent" : "received"
            }`}
          >
            <div className="message-bubble">
              <p className="message-text">{msg.content}</p>
              <span className="message-time">
                {formatTime(msg.createdAt)}
              </span>
            </div>
          </div>
        ))}
        {/* Invisible div at the bottom — scrollIntoView targets this */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form className="message-input-container" onSubmit={handleSend}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          className="message-input"
        />
        <button type="submit" className="send-btn">
          ➤
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
