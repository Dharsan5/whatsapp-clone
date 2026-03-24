import { useState, useEffect } from "react";
import { FiX, FiSearch, FiCheckSquare, FiFilter, FiFileText, FiVideo, FiImage } from "react-icons/fi";
import api from "../services/api";
import "./MediaModal.css";

const MediaModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("media"); // media, docs, links
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalMedia = async () => {
      try {
        const res = await api.get("/messages/global-media");
        setItems(res.data);
      } catch (err) {
        console.error("Failed to fetch global media:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalMedia();
  }, []);

  const mediaItems = items.filter(item => item.messageType === "image" || item.messageType === "video");
  const docItems = items.filter(item => item.messageType === "document");

  return (
    <div className="media-modal-overlay">
      <div className="media-modal-container">
        {/* Header */}
        <div className="media-modal-header">
          <div className="header-left">
            <FiX className="modal-close-btn" onClick={onClose} />
            <div className="header-title-wrapper">
              <h3>Media</h3>
              <span>Media from all chats</span>
            </div>
          </div>
          
          <div className="header-tabs">
            <span 
              className={`tab-item ${activeTab === 'media' ? 'active' : ''}`}
              onClick={() => setActiveTab('media')}
            >
              Media
            </span>
            <span 
              className={`tab-item ${activeTab === 'docs' ? 'active' : ''}`}
              onClick={() => setActiveTab('docs')}
            >
              Docs
            </span>
            <span 
              className={`tab-item ${activeTab === 'links' ? 'active' : ''}`}
              onClick={() => setActiveTab('links')}
            >
              Links
            </span>
          </div>

          <div className="header-right">
            <FiSearch size={20} className="modal-header-icon" />
            <FiFilter size={20} className="modal-header-icon" />
            <FiCheckSquare size={20} className="modal-header-icon" />
            <FiX size={24} className="modal-header-icon close-main" onClick={onClose} />
          </div>
        </div>

        {/* Content */}
        <div className="media-modal-content">
          {loading ? (
            <div className="modal-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : activeTab === 'media' ? (
            <div className="media-grid">
              {mediaItems.length > 0 ? (
                mediaItems.map((item) => (
                  <div key={item._id} className="media-grid-item">
                    {item.messageType === 'video' ? (
                      <div className="media-video-wrapper">
                        <video src={item.mediaUrl} />
                        <FiVideo className="video-overlay-icon" />
                      </div>
                    ) : (
                      <img src={item.mediaUrl} alt="Media" />
                    )}
                    <div className="media-sender-overlay">
                      {item.sender?.username}
                    </div>
                  </div>
                ))
              ) : (
                <div className="modal-empty-state">No media found</div>
              )}
            </div>
          ) : activeTab === 'docs' ? (
            <div className="docs-list">
              {docItems.length > 0 ? (
                docItems.map((item) => (
                  <a 
                    key={item._id} 
                    href={item.mediaUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="doc-list-item"
                  >
                    <div className="doc-icon-wrapper">
                      <FiFileText size={24} />
                    </div>
                    <div className="doc-details">
                      <div className="doc-name">{item.fileName || 'Document'}</div>
                      <div className="doc-meta">
                        {item.sender?.username} • {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="modal-empty-state">No documents found</div>
              )}
            </div>
          ) : (
            <div className="modal-empty-state">No links found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaModal;
