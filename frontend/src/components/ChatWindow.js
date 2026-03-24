import { useState, useEffect, useRef, useCallback } from "react";
import { FiSmile, FiArrowLeft, FiSearch, FiMoreVertical, FiPaperclip, FiSend } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { emptyChatImage } from "../utils/constants";
import DefaultAvatar from "./DefaultAvatar";
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

  // Handle typing indicator
  const handleInputChange = useCallback(
    (e) => {
      setNewMessage(e.target.value);

      if (!socket || !selectedUser) return;

      socket.emit("typing", {
        senderId: user._id,
        receiverId: selectedUser._id,
      });

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

  // Format timestamp
  const formatTime = (dateStr) => {
    const hours = new Date(dateStr).getHours();
    const minutes = new Date(dateStr).getMinutes();
    return `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`;
  };

  // Date label for separators
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

  // Empty state
  if (!selectedUser) {
    return (
      <div className="chat-window empty">
        <div className="empty-chat">
          <img src={emptyChatImage} alt="WhatsApp" className="empty-logo" />
          <h2>WhatsApp Web</h2>
          <p>Now send and receive messages without keeping your phone online.</p>
          <p className="empty-subtitle">
            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </p>
          <hr className="empty-divider" />
        </div>
      </div>
    );
  }

  const isTyping = typingUsers?.includes(selectedUser._id);
  let lastDateLabel = "";

  return (
    <div className="chat-window">
      {/* Chat header */}
      <div className="chat-header">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            <FiArrowLeft size={22} />
          </button>
        )}
        <DefaultAvatar name={selectedUser.username} size={40} />
        <div className="chat-header-info">
          <div className="chat-header-name">{selectedUser.username}</div>
          {isTyping ? (
            <div className="chat-header-typing">typing...</div>
          ) : (
            <div className="chat-header-status">
              {typingUsers ? "Online" : "Offline"}
            </div>
          )}
        </div>
        <div className="chat-header-icons">
          <span title="Search"><FiSearch size={20} /></span>
          <span title="Menu"><FiMoreVertical size={20} /></span>
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

      {/* Footer / Message input */}
      <form className="message-input-container" onSubmit={handleSend}>
        <div className="input-icons">
          <span title="Emoji"><FiSmile size={22} /></span>
          <span title="Attach"><FiPaperclip size={22} /></span>
        </div>
        <div className="message-input-wrapper">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message"
            className="message-input"
            disabled={sending}
          />
        </div>
        <button type="submit" className="send-btn" disabled={sending} title="Send">
          <FiSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
