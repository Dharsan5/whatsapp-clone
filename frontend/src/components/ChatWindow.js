import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { emptyChatImage, emptyProfilePicture } from "../utils/constants";
import "./ChatWindow.css";

const ChatWindow = ({
  selectedUser,
  messages,
  setMessages,
  socket,
  onMessageSent,
  typingUsers,
  onBack,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing indicator — emit events as user types
  const handleInputChange = useCallback(
    (e) => {
      setNewMessage(e.target.value);

      if (!socket || !selectedUser) return;

      // Emit "typing" event
      socket.emit("typing", {
        senderId: user._id,
        receiverId: selectedUser._id,
      });

      // Clear previous timeout and set a new one
      // After 2 seconds of no typing → emit "stop_typing"
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", {
          senderId: user._id,
          receiverId: selectedUser._id,
        });
      }, 2000);
    },
    [socket, selectedUser, user]
  );

  // Send message handler
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);

    // Stop typing indicator immediately on send
    if (socket && selectedUser) {
      socket.emit("stop_typing", {
        senderId: user._id,
        receiverId: selectedUser._id,
      });
    }

    try {
      const res = await api.post("/messages", {
        receiverId: selectedUser._id,
        content: newMessage.trim(),
      });

      setMessages((prev) => [...prev, res.data]);

      if (socket) {
        socket.emit("send_message", res.data);
      }

      // Update sidebar last message preview
      if (onMessageSent) {
        onMessageSent(res.data);
      }

      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  // Format timestamp — "2:30 PM"
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group messages by date for date separators
  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < oneDay && date.getDate() === now.getDate()) return "Today";
    if (diff < 2 * oneDay) return "Yesterday";
    return date.toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // If no user is selected, show a welcome screen
  if (!selectedUser) {
    return (
      <div className="chat-window empty">
        <div className="empty-chat">
          <img
            src={emptyChatImage}
            alt="WhatsApp"
            className="empty-logo"
          />
          <h2>WhatsApp Web</h2>
          <p>Send and receive messages without keeping your phone online.</p>
          <p className="empty-subtitle">Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
        </div>
      </div>
    );
  }

  const isTyping = typingUsers?.includes(selectedUser._id);

  // Build messages with date separators
  let lastDateLabel = "";

  return (
    <div className="chat-window">
      {/* Chat header */}
      <div className="chat-header">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            ←
          </button>
        )}
        <img
          src={emptyProfilePicture}
          alt={selectedUser.username}
          className="chat-header-avatar-img"
        />
        <div className="chat-header-info">
          <div className="chat-header-name">{selectedUser.username}</div>
          {isTyping && (
            <div className="chat-header-typing">typing...</div>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="messages-container">
        {messages.map((msg) => {
          const dateLabel = getDateLabel(msg.createdAt);
          const showDateSeparator = dateLabel !== lastDateLabel;
          lastDateLabel = dateLabel;

          return (
            <div key={msg._id}>
              {showDateSeparator && (
                <div className="date-separator">
                  <span>{dateLabel}</span>
                </div>
              )}
              <div
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
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form className="message-input-container" onSubmit={handleSend}>
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type a message"
          className="message-input"
          disabled={sending}
        />
        <button type="submit" className="send-btn" disabled={sending}>
          ➤
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
