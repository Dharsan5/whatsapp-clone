import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import DefaultAvatar from "./DefaultAvatar";
import { emptyChatImage } from "../utils/constants";
import "./ChatWindow.css";

// ── Icons ─────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z"/>
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/>
  </svg>
);

const VideoCallIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
  </svg>
);

const PhoneCallIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

const EmojiIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
  </svg>
);

const AttachIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H9v9.5a3 3 0 0 0 6 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5A5.5 5.5 0 0 0 12.5 23h.5a5.5 5.5 0 0 0 5.5-5.5V6h-2z"/>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

const MicIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
  </svg>
);

const CheckIcon = ({ double = false, read = false }) => (
  <span className={`msg-tick ${read ? "read" : ""}`}>
    {double ? "✓✓" : "✓"}
  </span>
);

// ── Component ─────────────────────────────────────────────────────────────────

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = useCallback(
    (e) => {
      setNewMessage(e.target.value);
      if (!socket || !selectedUser) return;
      socket.emit("typing", { senderId: user._id, receiverId: selectedUser._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", { senderId: user._id, receiverId: selectedUser._id });
      }, 2000);
    },
    [socket, selectedUser, user]
  );

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    if (socket && selectedUser) {
      socket.emit("stop_typing", { senderId: user._id, receiverId: selectedUser._id });
    }
    try {
      const res = await api.post("/messages", {
        receiverId: selectedUser._id,
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, res.data]);
      if (socket) socket.emit("send_message", res.data);
      if (onMessageSent) onMessageSent(res.data);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const h = d.getHours();
    const m = d.getMinutes();
    return `${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}`;
  };

  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const oneDay = 86400000;
    if (diff < oneDay && date.getDate() === now.getDate()) return "Today";
    if (diff < 2 * oneDay) return "Yesterday";
    return date.toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" });
  };

  // ── Empty state ──────────────────────────────────────────────────────────────
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
      {/* ── Header ── */}
      <div className="chat-header">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
        )}

        <div className="chat-header-avatar">
          <DefaultAvatar name={selectedUser.username} size={40} />
        </div>

        <div className="chat-header-info">
          <div className="chat-header-name">{selectedUser.username}</div>
          {isTyping ? (
            <div className="chat-header-typing">typing…</div>
          ) : (
            <div className="chat-header-status">Online</div>
          )}
        </div>

        <div className="chat-header-icons">
          <button className="header-icon-btn" title="Voice call">
            <PhoneCallIcon />
          </button>
          <button className="header-icon-btn" title="Video call">
            <VideoCallIcon />
          </button>
          <button className="header-icon-btn" title="Search">
            <SearchIcon />
          </button>
          <button className="header-icon-btn" title="Menu">
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="messages-container">
        {messages.map((msg) => {
          const dateLabel = getDateLabel(msg.createdAt);
          const showSep = dateLabel !== lastDateLabel;
          lastDateLabel = dateLabel;
          const isMine = msg.sender._id === user._id;

          return (
            <div key={msg._id}>
              {showSep && (
                <div className="date-separator">
                  <span>{dateLabel}</span>
                </div>
              )}
              <div className={`message ${isMine ? "sent" : "received"}`}>
                <div className="message-bubble">
                  {/* Media content */}
                  {msg.messageType === "image" && msg.mediaUrl && (
                    <img src={msg.mediaUrl} alt="img" className="message-media" />
                  )}
                  {msg.messageType === "video" && msg.mediaUrl && (
                    <video src={msg.mediaUrl} controls className="message-video" />
                  )}
                  {msg.messageType === "document" && msg.mediaUrl && (
                    <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="message-document">
                      <span className="doc-icon">📄</span>
                      <div className="doc-info">
                        <div className="doc-name">{msg.fileName || "Document"}</div>
                        <div className="doc-size">{msg.fileSize || ""}</div>
                      </div>
                    </a>
                  )}
                  {msg.messageType === "location" && (
                    <div className="message-location">
                      <div className="location-map-preview">📍 Location</div>
                    </div>
                  )}

                  {/* Text */}
                  {msg.content && (
                    <p className="message-text">{msg.content}</p>
                  )}

                  {/* Time + tick */}
                  <div className="message-meta">
                    <span className="message-time">{formatTime(msg.createdAt)}</span>
                    {isMine && <CheckIcon double read={msg.read} />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="message received">
            <div className="message-bubble typing-bubble">
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Footer ── */}
      <form className="message-input-container" onSubmit={handleSend}>
        {/* Emoji */}
        <button type="button" className="input-icon-btn" title="Emoji">
          <EmojiIcon />
        </button>

        {/* Attach */}
        <button type="button" className="input-icon-btn" title="Attach">
          <AttachIcon />
        </button>

        {/* Input */}
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

        {/* Send / Mic */}
        <button
          type={newMessage.trim() ? "submit" : "button"}
          className={`send-btn ${newMessage.trim() ? "send-active" : ""}`}
          title={newMessage.trim() ? "Send" : "Voice message"}
          disabled={sending}
        >
          {newMessage.trim() ? <SendIcon /> : <MicIcon />}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
