import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  FiPlus, FiMoreVertical, FiLock, FiX, FiSmile, 
  FiSend, FiArrowLeft, FiCamera, FiLayout, FiMaximize2
} from "react-icons/fi";
import api from "../services/api";
import NavSidebar from "../components/NavSidebar";
import DefaultAvatar from "../components/DefaultAvatar";
import EmojiPicker from "emoji-picker-react";
import "./Status.css";

const Status = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [statusGroups, setStatusGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedStatusIndex, setSelectedStatusIndex] = useState(0);

  // Status creation state
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  const fetchStatuses = async () => {
    try {
      const res = await api.get("/status");
      setStatusGroups(res.data);
    } catch (err) {
      console.error("Failed to fetch statuses:", err);
    }
  };

  useEffect(() => {
    if (user) fetchStatuses();
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
      setIsCreatorOpen(true);
    }
  };

  const handleUpload = async () => {
    if (!mediaFile && !caption) return;
    setUploading(true);
    try {
      const formData = new FormData();
      if (mediaFile) formData.append("media", mediaFile);
      formData.append("content", caption);
      await api.post("/status", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setMediaFile(null); setMediaPreview(""); setCaption(""); setIsCreatorOpen(false); fetchStatuses();
    } catch (err) {
      alert("Failed to upload status.");
    } finally { setUploading(false); }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || isReplying || !selectedGroup) return;
    setIsReplying(true);
    const currentStatus = selectedGroup.statuses[selectedStatusIndex];
    
    try {
      await api.post("/messages", {
        receiverId: selectedGroup.user._id,
        content: replyText,
        messageType: "text",
        repliedStatus: {
          mediaUrl: currentStatus.mediaUrl,
          mediaType: currentStatus.mediaType,
          caption: currentStatus.content
        }
      });
      setReplyText("");
      setSelectedGroup(null);
      alert("Reply sent!");
    } catch (err) {
      console.error("Failed to send status reply:", err);
    } finally {
      setIsReplying(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;
    if (diff < oneDay && date.getDate() === now.getDate()) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div></div>;
  if (!user) return null;

  const myStatusGroup = statusGroups.find(g => g.user._id === user._id);
  const otherStatusGroups = statusGroups.filter(g => g.user._id !== user._id);
  const currentStatus = selectedGroup?.statuses[selectedStatusIndex];

  return (
    <div className="chat-page">
      <div className="chat-container">
        <NavSidebar activePage="status" />

        <div className="status-sidebar">
          <div className="status-sidebar-header">
            <span className="status-sidebar-title">Status</span>
            <div className="status-sidebar-icons">
              <span className="status-header-icon" onClick={() => fileInputRef.current.click()}><FiPlus size={20} /></span>
              <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*,video/*" onChange={handleFileChange} />
              <span className="status-header-icon"><FiMoreVertical size={20} /></span>
            </div>
          </div>

          <div className={`status-item my-status ${selectedGroup?.user._id === user._id ? "active" : ""}`} onClick={() => { if (myStatusGroup) { setSelectedGroup(myStatusGroup); setSelectedStatusIndex(0); } else { fileInputRef.current.click(); } }}>
            <div className="status-avatar-wrapper my-status-avatar">
              <DefaultAvatar name={user.username} size={50} />
              <span className="status-add-badge"><FiPlus size={12} /></span>
            </div>
            <div className="status-info">
              <div className="status-name">My status</div>
              <div className="status-time-text">{myStatusGroup ? formatTime(myStatusGroup.statuses[0].createdAt) : "Click to add status update"}</div>
            </div>
          </div>

          {otherStatusGroups.length > 0 && (
            <>
              <div className="status-section-label">Recent</div>
              {otherStatusGroups.map((group) => (
                <div key={group.user._id} className={`status-item ${selectedGroup?.user._id === group.user._id ? "active" : ""}`} onClick={() => { setSelectedGroup(group); setSelectedStatusIndex(0); }}>
                  <div className="status-avatar-wrapper"><div className="status-ring"><DefaultAvatar name={group.user.username} size={44} /></div></div>
                  <div className="status-info">
                    <div className="status-name">{group.user.username}</div>
                    <div className="status-time-text">{formatTime(group.statuses[0].createdAt)}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="status-detail">
          {selectedGroup ? (
            <div className="status-viewer">
              <div className="status-viewer-header">
                <FiArrowLeft size={24} className="status-header-icon white-icon" onClick={() => setSelectedGroup(null)} />
                <DefaultAvatar name={selectedGroup.user.username} size={40} />
                <div className="status-viewer-user-info">
                  <div className="status-viewer-name">{selectedGroup.user.username}</div>
                  <div className="status-viewer-time">{formatTime(currentStatus?.createdAt)}</div>
                </div>
                <div className="status-viewer-actions">
                  <FiMoreVertical size={20} className="status-header-icon white-icon" />
                </div>
              </div>

              {/* Progress Bars */}
              <div className="status-progress-container">
                {selectedGroup.statuses.map((_, i) => (
                  <div key={i} className="status-progress-bg">
                    <div className={`status-progress-fill ${i === selectedStatusIndex ? "active" : i < selectedStatusIndex ? "filled" : ""}`} />
                  </div>
                ))}
              </div>

              {/* Media Content */}
              <div className="status-viewer-body">
                {currentStatus?.mediaUrl && (
                  currentStatus.mediaType === "video" ? (
                    <video src={currentStatus.mediaUrl} autoPlay className="status-viewer-media" onEnded={() => {
                        if (selectedStatusIndex < selectedGroup.statuses.length - 1) setSelectedStatusIndex(prev => prev + 1);
                    }} />
                  ) : (
                    <img src={currentStatus.mediaUrl} alt="Status" className="status-viewer-media" />
                  )
                )}
                {currentStatus?.content && <div className="status-viewer-caption">{currentStatus.content}</div>}
                
                {/* Navigation arrows */}
                {selectedStatusIndex > 0 && <div className="nav-arrow left" onClick={() => setSelectedStatusIndex(prev => prev - 1)}>&lt;</div>}
                {selectedStatusIndex < selectedGroup.statuses.length - 1 && <div className="nav-arrow right" onClick={() => setSelectedStatusIndex(prev => prev + 1)}>&gt;</div>}
              </div>

              {/* Reply Footer - Matches Screenshot */}
              {selectedGroup.user._id !== user._id && (
                <div className="status-viewer-footer">
                  <div className="status-reply-input-bar">
                    <FiSmile size={24} className="reply-icon" />
                    <FiLayout size={24} className="reply-icon" />
                    <input 
                      type="text" 
                      placeholder="Type a reply..." 
                      className="status-reply-input"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                    />
                    <div className="reply-send-btn" onClick={handleSendReply}>
                      <FiSend size={20} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="status-detail-empty">
              <div className="status-detail-content">
                <div className="status-detail-icon">
                  <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="#8696a0" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
                    <circle cx="12" cy="12" r="4" fill="#8696a0" stroke="none" />
                  </svg>
                </div>
                <h2 className="status-detail-title">Share status updates</h2>
                <p className="status-detail-desc">Share photos, videos and text that disappear after 24 hours.</p>
                <div className="status-detail-encrypted"><FiLock size={13} /><span>Your status updates are end-to-end encrypted</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Creator Modal */}
      {isCreatorOpen && (
        <div className="status-creator-overlay">
          <div className="status-creator-header">
            <FiX size={24} className="status-header-icon" onClick={() => setIsCreatorOpen(false)} />
            <span className="status-creator-title">Add Status</span>
          </div>
          <div className="status-creator-content">
            <div className="status-preview-container">
              {mediaPreview && (mediaFile?.type.startsWith("video") ? <video src={mediaPreview} controls className="status-preview-media" /> : <img src={mediaPreview} alt="Preview" className="status-preview-media" />)}
              <div className="status-input-wrapper">
                <span className="status-emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}><FiSmile size={24} /></span>
                {showEmojiPicker && <div className="status-emoji-picker"><EmojiPicker onEmojiClick={(d) => setCaption(p => p + d.emoji)} theme="dark" width={300} height={400} /></div>}
                <input type="text" className="status-text-input" placeholder="Type a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} onFocus={() => setShowEmojiPicker(false)} />
                <button className="status-upload-btn" onClick={handleUpload} disabled={uploading}><FiSend size={24} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Status;
