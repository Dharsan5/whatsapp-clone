import { useState, useEffect, useRef, useCallback } from "react";
import { 
  FiSmile, FiArrowLeft, FiSearch, FiMoreVertical, 
  FiPaperclip, FiSend, FiX, FiImage, FiFileText, 
  FiMapPin, FiCamera, FiLayout, FiDownload, FiVideo
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { emptyChatImage } from "../utils/constants";
import DefaultAvatar from "./DefaultAvatar";
import EmojiPicker from "emoji-picker-react";
import "./ChatWindow.css";

const AttachmentMenu = ({ onSelect, onClose }) => {
  return (
    <div className="attachment-menu" onMouseLeave={onClose}>
      <div className="attachment-item" onClick={() => onSelect('image')}>
        <div className="attach-icon-circle attach-photos"><FiImage size={24} /></div>
        <span>Photos & Videos</span>
      </div>
      <div className="attachment-item" onClick={() => onSelect('camera')}>
        <div className="attach-icon-circle attach-camera"><FiCamera size={24} /></div>
        <span>Camera</span>
      </div>
      <div className="attachment-item" onClick={() => onSelect('document')}>
        <div className="attach-icon-circle attach-document"><FiFileText size={24} /></div>
        <span>Document</span>
      </div>
      <div className="attachment-item" onClick={() => onSelect('location')}>
        <div className="attach-icon-circle attach-location"><FiMapPin size={24} /></div>
        <span>Location</span>
      </div>
    </div>
  );
};

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
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [fileCaption, setFileCaption] = useState("");
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = useCallback((e) => {
    setNewMessage(e.target.value);
    if (!socket || !selectedUser) return;
    socket.emit("typing", { senderId: user._id, receiverId: selectedUser._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { senderId: user._id, receiverId: selectedUser._id });
    }, 2000);
  }, [socket, selectedUser, user]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || sending) return;
    await sendMessageData({ content: newMessage.trim(), messageType: "text" });
    setNewMessage("");
  };

  const sendMessageData = async (data) => {
    setSending(true);
    if (socket && selectedUser) socket.emit("stop_typing", { senderId: user._id, receiverId: selectedUser._id });
    try {
      let response;
      if (data.file) {
        const formData = new FormData();
        formData.append("receiverId", selectedUser._id);
        formData.append("media", data.file);
        formData.append("content", data.caption || "");
        formData.append("messageType", data.messageType);
        response = await api.post("/messages", formData, { headers: { "Content-Type": "multipart/form-data" } });
      } else if (data.location) {
        response = await api.post("/messages", { receiverId: selectedUser._id, messageType: "location", location: data.location });
      } else {
        response = await api.post("/messages", { receiverId: selectedUser._id, content: data.content, messageType: data.messageType || "text" });
      }
      setMessages((prev) => [...prev, response.data]);
      if (socket) socket.emit("send_message", response.data);
      if (onMessageSent) onMessageSent(response.data);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally { setSending(false); }
  };

  const openFileSelector = (type) => {
    setShowAttachmentMenu(false);
    if (type === 'image' || type === 'camera') fileInputRef.current.click();
    if (type === 'document') docInputRef.current.click();
    if (type === 'location') sendCurrentLocation();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSendFile = async () => {
    if (!fileToUpload) return;
    let type = "document";
    if (fileToUpload.type.startsWith("image")) type = "image";
    else if (fileToUpload.type.startsWith("video")) type = "video";
    await sendMessageData({ file: fileToUpload, caption: fileCaption, messageType: type });
    setFileToUpload(null); setFilePreview(""); setFileCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const sendCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition((pos) => {
      sendMessageData({ location: { latitude: pos.coords.latitude, longitude: pos.coords.longitude, label: "Current Location" } });
    }, () => alert("Unable to retrieve location"));
  };

  const onEmojiSelect = (emojiData) => setNewMessage((p) => p + emojiData.emoji);

  const MessageBubble = ({ msg }) => {
    const isMe = msg.sender._id === user._id;

    return (
      <div className={`message ${isMe ? "sent" : "received"}`}>
        <div className="message-bubble">
          {/* Status Reply Quote */}
          {msg.repliedStatus && (
            <div className="status-reply-preview">
              {msg.repliedStatus.mediaUrl ? (
                msg.repliedStatus.mediaType === "video" ? (
                  <div className="status-reply-placeholder"><FiVideo size={20} color="#00a884" /></div>
                ) : (
                  <img src={msg.repliedStatus.mediaUrl} alt="Reply" className="status-reply-thumb" />
                )
              ) : (
                <div className="status-reply-placeholder"><FiLayout size={20} color="#00a884" /></div>
              )}
              <div className="status-reply-info">
                <div className="reply-title">Status</div>
                <div className="reply-caption">{msg.repliedStatus.caption || (msg.repliedStatus.mediaType === "image" ? "Photo" : msg.repliedStatus.mediaType === "video" ? "Video" : "Status Update")}</div>
              </div>
            </div>
          )}

          {msg.messageType === "image" && <img src={msg.mediaUrl} alt="Sent image" className="message-media" />}
          {msg.messageType === "video" && <video src={msg.mediaUrl} controls className="message-video" />}
          {msg.messageType === "document" && (
            <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="message-document">
              <div className="attach-icon-circle attach-document"><FiDownload size={20} /></div>
              <div className="doc-info"><div className="doc-name">{msg.fileName || "Document"}</div><div className="doc-size">PDF • 1.2 MB</div></div>
            </a>
          )}
          {msg.messageType === "location" && (
            <a href={`https://www.google.com/maps?q=${msg.location.latitude},${msg.location.longitude}`} target="_blank" rel="noreferrer" className="message-location">
              <div className="location-map-preview"><FiMapPin size={24} /><span>Google Maps View</span></div>
              <div className="location-label">📍 {msg.location.label || "Pinned Location"}</div>
            </a>
          )}
          {msg.content && <p className="message-text">{msg.content}</p>}
          <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    );
  };

  if (!selectedUser) return (
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

  return (
    <div className="chat-window">
      <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*,video/*" onChange={handleFileSelect} />
      <input type="file" ref={docInputRef} style={{ display: "none" }} accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={handleFileSelect} />
      
      <div className="chat-header">
        {onBack && <button className="back-btn" onClick={onBack}><FiArrowLeft size={22} /></button>}
        <DefaultAvatar name={selectedUser.username} size={40} />
        <div className="chat-header-info">
          <div className="chat-header-name">{selectedUser.username}</div>
          <div className="chat-header-status">{typingUsers?.includes(selectedUser._id) ? <span className="chat-header-typing">typing...</span> : "Online"}</div>
        </div>
        <div className="chat-header-icons"><span><FiSearch size={20} /></span><span><FiMoreVertical size={20} /></span></div>
      </div>

      <div className="messages-container">{messages.map((m) => <MessageBubble key={m._id} msg={m} />)}<div ref={messagesEndRef} /></div>

      {showEmojiPicker && <div className="emoji-picker-wrapper"><EmojiPicker onEmojiClick={onEmojiSelect} theme="dark" width={320} height={400} /></div>}
      {showAttachmentMenu && <AttachmentMenu onSelect={openFileSelector} onClose={() => setShowAttachmentMenu(false)} />}

      <form className="message-input-container" onSubmit={handleSend}>
        <div className="input-icons">
          <span onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachmentMenu(false); }}><FiSmile size={24} color={showEmojiPicker ? "#00a884" : "#8696a0"} /></span>
          <span onClick={() => { setShowAttachmentMenu(!showAttachmentMenu); setShowEmojiPicker(false); }}><FiPaperclip size={24} color={showAttachmentMenu ? "#00a884" : "#8696a0"} /></span>
        </div>
        <div className="message-input-wrapper"><input type="text" value={newMessage} onChange={handleInputChange} placeholder="Type a message" className="message-input" disabled={sending} onFocus={() => { setShowEmojiPicker(false); setShowAttachmentMenu(false); }} /></div>
        <button type="submit" className="send-btn" disabled={sending || !newMessage.trim()}><FiSend size={24} /></button>
      </form>

      {fileToUpload && (
        <div className="file-preview-overlay">
          <div className="file-preview-header"><FiX size={24} className="send-btn" onClick={() => { setFileToUpload(null); setFilePreview(""); }} /><span>Send File</span></div>
          <div className="file-preview-content">
            <div className="preview-media-container">{fileToUpload.type.startsWith('video') ? <video src={filePreview} controls /> : <img src={filePreview} alt="Preview" />}<div style={{'textAlign': 'center', 'marginTop': '10px', 'color': '#8696a0'}}>{fileToUpload.name}</div></div>
            <div className="preview-footer"><input className="preview-caption-input" placeholder="Add a caption..." value={fileCaption} onChange={(e) => setFileCaption(e.target.value)} /><button className="preview-send-btn" onClick={handleSendFile} disabled={sending}><FiSend size={24} /></button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
