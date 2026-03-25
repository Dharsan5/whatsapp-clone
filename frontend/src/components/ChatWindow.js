import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import DefaultAvatar from "./DefaultAvatar";
import { emptyChatImage } from "../utils/constants";
import "./ChatWindow.css";

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const SearchIcon    = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z"/></svg>;
const MenuIcon      = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/></svg>;
const VideoCallIcon = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>;
const PhoneIcon     = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>;
const EmojiIcon     = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>;
const AttachIcon    = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H9v9.5a3 3 0 0 0 6 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5A5.5 5.5 0 0 0 12.5 23h.5a5.5 5.5 0 0 0 5.5-5.5V6h-2z"/></svg>;
const SendIcon      = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>;
const MicIcon       = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>;
const CloseIcon     = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>;
const BackIcon      = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>;
const ChevronDownIcon = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>;
const EndCallIcon   = () => <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>;

// Emoji data
const EMOJI_CATEGORIES = {
  "😊 Smileys": ["😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","😈","👿"],
  "👋 Gestures": ["👋","🤚","🖐","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏"],
  "❤️ Hearts": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☯️","🔥","💯","💫","⭐","🌟","✨","💥","❗","‼️","❓","💢"],
  "🎉 Activities": ["🎉","🎊","🎈","🎁","🎀","🎂","🍰","🥂","🍾","🥳","🎆","🎇","🧨","✨","🎤","🎧","🎼","🎵","🎶","🎸","🎹","🥁","🎺","🎻","🪘","🎮","🕹️","🎲","♟️","🎯","🎳","🏆","🥇","🥈","🥉","🏅","🎖️"],
};

// ── Main Component ─────────────────────────────────────────────────────────────
const ChatWindow = ({ selectedUser, messages, setMessages, socket, onMessageSent, typingUsers, onBack }) => {
  const { user } = useAuth();

  // Core state
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending]       = useState(false);

  // UI panels
  const [showSearch, setShowSearch]         = useState(false);
  const [showAttach, setShowAttach]         = useState(false);
  const [showEmoji, setShowEmoji]           = useState(false);
  const [showMenu, setShowMenu]             = useState(false);
  const [showEmojiCat, setShowEmojiCat]     = useState("😊 Smileys");
  const [callState, setCallState]           = useState(null); // { type: 'audio'|'video', status: 'calling'|'ongoing' }
  const [callTimer, setCallTimer]           = useState(0);
  const [searchQuery, setSearchQuery]       = useState("");
  const [searchResults, setSearchResults]   = useState([]);
  const [searchIndex, setSearchIndex]       = useState(0);
  const [filePreview, setFilePreview]       = useState(null); // { file, url, type, caption }
  const [toast, setToast]                   = useState(null);

  const messagesEndRef  = useRef(null);
  const typingTimeout   = useRef(null);
  const fileInputRef    = useRef(null);
  const callTimerRef    = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Call timer
  useEffect(() => {
    if (callState?.status === "ongoing") {
      callTimerRef.current = setInterval(() => setCallTimer(t => t + 1), 1000);
    } else {
      clearInterval(callTimerRef.current);
      setCallTimer(0);
    }
    return () => clearInterval(callTimerRef.current);
  }, [callState]);

  // Close dropdowns on outside click
  useEffect(() => {
    const close = () => { setShowMenu(false); setShowAttach(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // Search in messages
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const results = messages
      .map((m, i) => ({ ...m, index: i }))
      .filter(m => m.content?.toLowerCase().includes(q));
    setSearchResults(results);
    setSearchIndex(0);
  }, [searchQuery, messages]);

  const showToast = (msg, duration = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  };

  const handleInputChange = useCallback((e) => {
    setNewMessage(e.target.value);
    if (!socket || !selectedUser) return;
    socket.emit("typing", { senderId: user._id, receiverId: selectedUser._id });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", { senderId: user._id, receiverId: selectedUser._id });
    }, 2000);
  }, [socket, selectedUser, user]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    socket?.emit("stop_typing", { senderId: user._id, receiverId: selectedUser._id });
    try {
      const res = await api.post("/messages", { receiverId: selectedUser._id, content: newMessage.trim() });
      setMessages(prev => [...prev, res.data]);
      socket?.emit("send_message", res.data);
      onMessageSent?.(res.data);
      setNewMessage("");
      setShowEmoji(false);
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleFileSelect = (type) => {
    setShowAttach(false);
    fileInputRef.current.accept =
      type === "image" ? "image/*" :
      type === "video" ? "video/*" :
      type === "document" ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip" :
      "image/*,video/*";
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("image") ? "image" :
                 file.type.startsWith("video") ? "video" : "document";
    setFilePreview({ file, url, type, caption: "" });
    e.target.value = "";
  };

  const handleFileSend = async () => {
    if (!filePreview || sending) return;
    setSending(true);

    // Determine messageType from file
    const msgType = filePreview.file.type.startsWith("image") ? "image"
                  : filePreview.file.type.startsWith("video") ? "video"
                  : "document";

    // ── Optimistic: show the file immediately in the chat ──
    const tempId = "temp_" + Date.now();
    const tempMsg = {
      _id: tempId,
      sender: { _id: user._id, username: user.username },
      receiver: { _id: selectedUser._id, username: selectedUser.username },
      content: filePreview.caption || "",
      messageType: msgType,
      mediaUrl: filePreview.url,   // local blob URL
      fileName: filePreview.file.name,
      fileSize: (filePreview.file.size / 1024).toFixed(1) + " KB",
      createdAt: new Date().toISOString(),
      read: false,
      _isTemp: true,
    };
    setMessages(prev => [...prev, tempMsg]);
    setFilePreview(null);

    // ── Real upload ──
    try {
      const formData = new FormData();
      formData.append("receiverId", selectedUser._id);
      formData.append("content", filePreview.caption || "");
      formData.append("media", filePreview.file);
      const res = await api.post("/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Replace the temp message with the real one
      setMessages(prev => prev.map(m => m._id === tempId ? res.data : m));
      socket?.emit("send_message", res.data);
      onMessageSent?.(res.data);
    } catch (err) {
      console.error("File upload failed:", err);
      // Keep the temp message visible but mark it failed
      setMessages(prev => prev.map(m =>
        m._id === tempId ? { ...m, _failed: true } : m
      ));
      showToast("❌ Upload failed — file shown locally only");
    } finally {
      setSending(false);
    }
  };

  const startCall = (type) => {
    setCallState({ type, status: "calling" });
    setTimeout(() => setCallState({ type, status: "ongoing" }), 2000);
  };

  const endCall = () => { setCallState(null); };

  const formatCallTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const h = d.getHours(), m = d.getMinutes();
    return `${h < 10 ? "0"+h : h}:${m < 10 ? "0"+m : m}`;
  };

  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr), now = new Date(), diff = now - date, day = 86400000;
    if (diff < day && date.getDate() === now.getDate()) return "Today";
    if (diff < 2*day) return "Yesterday";
    return date.toLocaleDateString([], { day:"numeric", month:"long", year:"numeric" });
  };

  // ── Empty state ───────────────────────────────────────────────────────────────
  if (!selectedUser) {
    return (
      <div className="chat-window empty">
        <div className="empty-chat">
          <img src={emptyChatImage} alt="WhatsApp" className="empty-logo" />
          <h2>WhatsApp Web</h2>
          <p>Now send and receive messages without keeping your phone online.</p>
          <p className="empty-subtitle">Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
          <hr className="empty-divider" />
        </div>
      </div>
    );
  }

  const isTyping = typingUsers?.includes(selectedUser._id);
  let lastDateLabel = "";

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="chat-window" onClick={() => { setShowMenu(false); setShowAttach(false); }}>

      {/* ── Toast ── */}
      {toast && <div className="chat-toast">{toast}</div>}

      {/* ── Call Overlay ── */}
      {callState && (
        <div className="call-overlay">
          <div className="call-avatar-ring">
            <DefaultAvatar name={selectedUser.username} size={90} />
          </div>
          <div className="call-name">{selectedUser.username}</div>
          <div className="call-status">
            {callState.status === "calling"
              ? (callState.type === "video" ? "Video calling…" : "Calling…")
              : formatCallTime(callTimer)}
          </div>
          {callState.type === "video" && callState.status === "ongoing" && (
            <div className="video-placeholder">
              <span>📹 Video</span>
            </div>
          )}
          <div className="call-actions">
            <button className="call-btn end-call" onClick={endCall} title="End call">
              <EndCallIcon />
            </button>
          </div>
        </div>
      )}

      {filePreview && (
        <div className="file-preview-overlay">
          {/* Header */}
          <div className="file-preview-header">
            <button className="header-icon-btn" onClick={() => setFilePreview(null)}>
              <CloseIcon />
            </button>
            <span className="file-preview-title">Send to {selectedUser.username}</span>
          </div>

          {/* Body */}
          <div className="file-preview-content">
            {filePreview.type === "image" && (
              <img src={filePreview.url} alt="preview" className="fp-image" />
            )}
            {filePreview.type === "video" && (
              <video src={filePreview.url} controls className="fp-image" />
            )}
            {filePreview.type === "document" && (
              <div className="fp-doc-card">
                <svg viewBox="0 0 48 64" width="52" height="68" fill="none">
                  <rect width="48" height="64" rx="6" fill="#2a3942"/>
                  <rect x="8" y="20" width="32" height="3" rx="1.5" fill="#8696a0"/>
                  <rect x="8" y="28" width="32" height="3" rx="1.5" fill="#8696a0"/>
                  <rect x="8" y="36" width="20" height="3" rx="1.5" fill="#8696a0"/>
                  <rect x="30" y="2" width="16" height="16" rx="2" fill="#1d2b34"/>
                  <path d="M30 2 L46 18" stroke="#2a3942" strokeWidth="2"/>
                </svg>
                <div className="fp-doc-name">{filePreview.file.name}</div>
                <div className="fp-doc-size">{(filePreview.file.size / 1024).toFixed(1)} KB</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="file-preview-footer">
            <input
              className="fp-caption-input"
              placeholder="Add a caption…"
              value={filePreview.caption}
              onChange={e => setFilePreview(f => ({ ...f, caption: e.target.value }))}
            />
            <button className="fp-send-btn" onClick={handleFileSend}>
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      {/* ── Search Bar (slides in) ── */}
      {showSearch && (
        <div className="chat-search-bar">
          <button className="header-icon-btn" onClick={() => { setShowSearch(false); setSearchQuery(""); }}><CloseIcon /></button>
          <input
            className="chat-search-input"
            autoFocus
            placeholder="Search messages…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchResults.length > 0 && (
            <span className="search-count">{searchIndex + 1}/{searchResults.length}</span>
          )}
          <button className="header-icon-btn" onClick={() => setSearchIndex(i => Math.max(0, i - 1))} disabled={searchIndex === 0}><BackIcon /></button>
          <button className="header-icon-btn" onClick={() => setSearchIndex(i => Math.min(searchResults.length - 1, i + 1))} disabled={searchIndex >= searchResults.length - 1}><ChevronDownIcon /></button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="chat-header" onClick={e => e.stopPropagation()}>
        {onBack && (
          <button className="back-btn" onClick={onBack}><BackIcon /></button>
        )}
        <div className="chat-header-avatar">
          <DefaultAvatar name={selectedUser.username} size={40} />
        </div>
        <div className="chat-header-info">
          <div className="chat-header-name">{selectedUser.username}</div>
          {isTyping
            ? <div className="chat-header-typing">typing…</div>
            : <div className="chat-header-status">Online</div>}
        </div>
        <div className="chat-header-icons">
          <button className="header-icon-btn" title="Voice call" onClick={() => startCall("audio")}><PhoneIcon /></button>
          <button className="header-icon-btn" title="Video call" onClick={() => startCall("video")}><VideoCallIcon /></button>
          <button className="header-icon-btn" title="Search" onClick={() => setShowSearch(s => !s)}><SearchIcon /></button>
          {/* Menu */}
          <div style={{ position: "relative" }}>
            <button className="header-icon-btn" title="Menu" onClick={e => { e.stopPropagation(); setShowMenu(s => !s); }}><MenuIcon /></button>
            {showMenu && (
              <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
                {["Contact info", "Select messages", "Mute notifications", "Disappearing messages", "Clear messages", "Delete chat", "Report"].map(item => (
                  <div key={item} className={`dropdown-item${item === "Delete chat" || item === "Report" ? " danger" : ""}`}
                    onClick={() => { showToast(`"${item}" coming soon`); setShowMenu(false); }}>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="messages-container">
        {messages.map((msg) => {
          const dateLabel = getDateLabel(msg.createdAt);
          const showSep = dateLabel !== lastDateLabel;
          lastDateLabel = dateLabel;
          const isMine = msg.sender._id === user._id;
          const highlighted = searchResults[searchIndex]?._id === msg._id;

          return (
            <div key={msg._id}>
              {showSep && <div className="date-separator"><span>{dateLabel}</span></div>}
              <div className={`message ${isMine ? "sent" : "received"}${highlighted ? " highlighted" : ""}${msg._failed ? " failed-msg" : ""}`}>
                <div className="message-bubble">
                  {/* Image */}
                  {msg.messageType === "image" && msg.mediaUrl && (
                    <img src={msg.mediaUrl} alt="img" className="message-media" />
                  )}
                  {/* Video */}
                  {msg.messageType === "video" && msg.mediaUrl && (
                    <video src={msg.mediaUrl} controls className="message-video" />
                  )}
                  {/* Document */}
                  {msg.messageType === "document" && (
                    <a
                      href={msg.mediaUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="message-document"
                      onClick={e => { if (!msg.mediaUrl || msg._isTemp) e.preventDefault(); }}
                    >
                      <div className="doc-icon-box">
                        <svg viewBox="0 0 24 32" width="28" height="36" fill="none">
                          <rect width="24" height="32" rx="3" fill="#3b4a54"/>
                          <rect x="4" y="10" width="16" height="2" rx="1" fill="#8696a0"/>
                          <rect x="4" y="15" width="16" height="2" rx="1" fill="#8696a0"/>
                          <rect x="4" y="20" width="10" height="2" rx="1" fill="#8696a0"/>
                        </svg>
                      </div>
                      <div className="doc-info">
                        <div className="doc-name">{msg.fileName || "Document"}</div>
                        <div className="doc-size">{msg.fileSize || ""}</div>
                      </div>
                      {msg._isTemp && <span className="doc-uploading">⏳</span>}
                    </a>
                  )}
                  {/* Location */}
                  {msg.messageType === "location" && (
                    <div className="message-location"><div className="location-map-preview">📍 Location</div></div>
                  )}
                  {/* Caption / text */}
                  {msg.content && <p className="message-text">{msg.content}</p>}
                  <div className="message-meta">
                    <span className="message-time">{formatTime(msg.createdAt)}</span>
                    {isMine && (
                      <span className={`msg-tick${msg.read ? " read" : ""}${msg._isTemp ? " pending" : ""}`}>
                        {msg._isTemp ? "🕐" : "✓✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="message received">
            <div className="message-bubble typing-bubble">
              <span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Emoji Picker ── */}
      {showEmoji && (
        <div className="emoji-panel" onClick={e => e.stopPropagation()}>
          <div className="emoji-categories">
            {Object.keys(EMOJI_CATEGORIES).map(cat => (
              <button key={cat} className={`emoji-cat-btn${showEmojiCat === cat ? " active" : ""}`}
                onClick={() => setShowEmojiCat(cat)}>
                {cat.split(" ")[0]}
              </button>
            ))}
          </div>
          <div className="emoji-label">{showEmojiCat}</div>
          <div className="emoji-grid">
            {EMOJI_CATEGORIES[showEmojiCat].map(e => (
              <button key={e} className="emoji-btn" onClick={() => handleEmojiClick(e)}>{e}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── Attach Menu ── */}
      {showAttach && (
        <div className="attachment-menu" onClick={e => e.stopPropagation()}>
          {[
            { label: "Photos & Videos", cls: "attach-photos", emoji: "🖼️", type: "image" },
            { label: "Camera",          cls: "attach-camera",  emoji: "📷", type: "image" },
            { label: "Document",        cls: "attach-document",emoji: "📄", type: "document" },
            { label: "Location",        cls: "attach-location",emoji: "📍", type: "location" },
          ].map(({ label, cls, emoji, type }) => (
            <div key={label} className="attachment-item" onClick={() => {
              if (type === "location") { showToast("📍 Location sharing coming soon"); setShowAttach(false); }
              else handleFileSelect(type);
            }}>
              <div className={`attach-icon-circle ${cls}`}>{emoji}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileChange} />

      {/* ── Footer ── */}
      <form className="message-input-container" onSubmit={handleSend} onClick={e => e.stopPropagation()}>
        <button type="button" className={`input-icon-btn${showEmoji ? " active-icon" : ""}`} title="Emoji"
          onClick={() => { setShowEmoji(s => !s); setShowAttach(false); }}>
          <EmojiIcon />
        </button>

        <button type="button" className={`input-icon-btn${showAttach ? " active-icon" : ""}`} title="Attach"
          onClick={e => { e.stopPropagation(); setShowAttach(s => !s); setShowEmoji(false); }}>
          <AttachIcon />
        </button>

        <div className="message-input-wrapper">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="message-input"
            disabled={sending}
          />
        </div>

        <button
          type={newMessage.trim() ? "submit" : "button"}
          className={`send-btn${newMessage.trim() ? " send-active" : ""}`}
          title={newMessage.trim() ? "Send" : "Voice message"}
          disabled={sending}
          onClick={!newMessage.trim() ? () => showToast("🎤 Voice messages coming soon") : undefined}
        >
          {newMessage.trim() ? <SendIcon /> : <MicIcon />}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
