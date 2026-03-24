import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  FiSearch, FiX, FiInfo, FiKey, FiLock, FiMessageSquare, 
  FiBell, FiCommand, FiHelpCircle, FiUser, FiArrowLeft, 
  FiCamera, FiEdit2, FiCheck, FiMoon, FiImage, FiSettings, FiKeyboard
} from "react-icons/fi";
import NavSidebar from "../components/NavSidebar";
import DefaultAvatar from "./DefaultAvatar";
import MediaModal from "../components/MediaModal";
import "./Settings.css";

const Settings = () => {
  const { user, loading, updateProfile } = useAuth();
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubPage, setActiveSubPage] = useState(null); // 'account', 'privacy', 'chats', etc.

  // Profile Edit State
  const [editName, setEditName] = useState(user?.fullName || "");
  const [editAbout, setEditAbout] = useState(user?.about || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div></div>;
  if (!user) return null;

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("fullName", editName);
      formData.append("about", editAbout);
      await updateProfile(formData);
      setIsEditingName(false);
      setIsEditingAbout(false);
    } catch (err) { alert("Failed to update profile"); }
  };

  const settingsOptions = [
    { id: 'account', icon: <FiKey />, title: "Account", desc: "Security notifications, account info" },
    { id: 'privacy', icon: <FiLock />, title: "Privacy", desc: "Blocked contacts, disappearing messages" },
    { id: 'chats', icon: <FiMessageSquare />, title: "Chats", desc: "Theme, wallpaper, chat settings" },
    { id: 'notifications', icon: <FiBell />, title: "Notifications", desc: "Messages, groups, sounds" },
    { id: 'keyboard', icon: <FiCommand />, title: "Keyboard shortcuts", desc: "Quick actions" },
    { id: 'help', icon: <FiHelpCircle />, title: "Help", desc: "Help center, contact us, privacy policy" },
    { id: 'profile', icon: <FiUser />, title: "Profile", desc: "Name, about, photo" },
  ];

  const renderSubPage = () => {
    switch (activeSubPage) {
      case 'profile':
        return (
          <div className="subpage-container">
            <div className="subpage-header">
              <FiArrowLeft className="back-icon" onClick={() => setActiveSubPage(null)} />
              <h2>Profile</h2>
            </div>
            <div className="profile-section">
              <div className="profile-photo-edit">
                <DefaultAvatar name={user.fullName || user.username} size={200} />
                <div className="photo-overlay"><FiCamera size={30} /><span>CHANGE PROFILE PHOTO</span></div>
              </div>
              <div className="edit-field">
                <div className="field-label">Your name</div>
                <div className="field-content">
                  {isEditingName ? (
                    <div className="editing-input">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                      <FiCheck className="save-icon" onClick={handleUpdateProfile} />
                    </div>
                  ) : (
                    <><span>{user.fullName || user.username}</span><FiEdit2 className="edit-icon" onClick={() => setIsEditingName(true)} /></>
                  )}
                </div>
                <p className="field-hint">This is not your username or pin. This name will be visible to your WhatsApp contacts.</p>
              </div>
              <div className="edit-field">
                <div className="field-label">About</div>
                <div className="field-content">
                  {isEditingAbout ? (
                    <div className="editing-input">
                      <input value={editAbout} onChange={(e) => setEditAbout(e.target.value)} autoFocus />
                      <FiCheck className="save-icon" onClick={handleUpdateProfile} />
                    </div>
                  ) : (
                    <><span>{user.about || "Hey there! I am using WhatsApp."}</span><FiEdit2 className="edit-icon" onClick={() => setIsEditingAbout(true)} /></>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'chats':
        return (
          <div className="subpage-container">
            <div className="subpage-header"><FiArrowLeft className="back-icon" onClick={() => setActiveSubPage(null)} /><h2>Chats</h2></div>
            <div className="settings-list">
              <div className="settings-item"><div className="settings-icon"><FiMoon /></div><div className="settings-text">Theme</div><div className="settings-value">Dark</div></div>
              <div className="settings-item"><div className="settings-icon"><FiImage /></div><div className="settings-text">Chat wallpaper</div></div>
              <div className="settings-divider">Display</div>
              <div className="settings-item-check"><div className="settings-text">Enter is send</div><input type="checkbox" defaultChecked /></div>
              <div className="settings-item-check"><div className="settings-text">Show message previews</div><input type="checkbox" defaultChecked /></div>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="subpage-container">
            <div className="subpage-header"><FiArrowLeft className="back-icon" onClick={() => setActiveSubPage(null)} /><h2>Privacy</h2></div>
            <div className="settings-list">
              <div className="settings-item"><div className="settings-text">Last seen and online</div><div className="settings-value">Everyone</div></div>
              <div className="settings-item"><div className="settings-text">Profile photo</div><div className="settings-value">Everyone</div></div>
              <div className="settings-item"><div className="settings-text">Status</div><div className="settings-value">My contacts</div></div>
              <div className="settings-item-check"><div className="settings-text">Read receipts</div><input type="checkbox" defaultChecked /></div>
              <div className="settings-divider">Disappearing messages</div>
              <div className="settings-item"><div className="settings-text">Default message timer</div><div className="settings-value">Off</div></div>
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="subpage-container">
            <div className="subpage-header"><FiArrowLeft className="back-icon" onClick={() => setActiveSubPage(null)} /><h2>Account</h2></div>
            <div className="settings-list">
              <div className="settings-item"><div className="settings-icon"><FiBell /></div><div className="settings-text">Security notifications</div></div>
              <div className="settings-item"><div className="settings-icon"><FiKey /></div><div className="settings-text">Two-step verification</div></div>
              <div className="settings-item"><div className="settings-icon"><FiInfo /></div><div className="settings-text">Request account info</div></div>
              <div className="settings-item"><div className="settings-text" style={{color: '#f15c6d'}}>Delete my account</div></div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="subpage-container">
            <div className="subpage-header"><FiArrowLeft className="back-icon" onClick={() => setActiveSubPage(null)} /><h2>Notifications</h2></div>
            <div className="settings-list">
              <div className="settings-divider">Messages</div>
              <div className="settings-item-check"><div className="settings-text">Notification sounds</div><input type="checkbox" defaultChecked /></div>
              <div className="settings-item-check"><div className="settings-text">Desktop alerts</div><input type="checkbox" defaultChecked /></div>
              <div className="settings-divider">Groups</div>
              <div className="settings-item-check"><div className="settings-text">Group notification sounds</div><input type="checkbox" defaultChecked /></div>
            </div>
          </div>
        );
      case 'keyboard':
        return (
          <div className="subpage-container">
            <div className="subpage-header"><FiArrowLeft className="back-icon" onClick={() => setActiveSubPage(null)} /><h2>Keyboard shortcuts</h2></div>
            <div className="shortcuts-list">
              <div className="shortcut-item"><span>Mark as unread</span><kbd>Ctrl + Alt + Shift + U</kbd></div>
              <div className="shortcut-item"><span>Mute chat</span><kbd>Ctrl + Alt + Shift + M</kbd></div>
              <div className="shortcut-item"><span>Archive chat</span><kbd>Ctrl + Alt + Shift + E</kbd></div>
              <div className="shortcut-item"><span>Delete chat</span><kbd>Ctrl + Alt + Backspace</kbd></div>
              <div className="shortcut-item"><span>Pin chat</span><kbd>Ctrl + Alt + Shift + P</kbd></div>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="subpage-container">
            <div className="subpage-header"><FiArrowLeft className="back-icon" onClick={() => setActiveSubPage(null)} /><h2>Help</h2></div>
            <div className="settings-list">
              <div className="settings-item"><div className="settings-text">Help Center</div></div>
              <div className="settings-item"><div className="settings-text">Contact us</div></div>
              <div className="settings-item"><div className="settings-text">Terms and Privacy Policy</div></div>
            </div>
          </div>
        );
      default:
        return (
          <div className="settings-empty-state">
            <div className="empty-gear-icon"><FiSettings size={80} color="#2a3942" /></div>
            <h2>Settings</h2>
          </div>
        );
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <NavSidebar activePage="settings" onMediaClick={() => setShowMediaModal(true)} />

        <div className="settings-sidebar">
          <div className="settings-header"><h3>Settings</h3></div>
          <div className="settings-search"><div className="search-wrapper"><FiSearch className="search-icon" /><input type="text" placeholder="Search settings" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></div>
          <div className="settings-scroll-area">
            <div className="settings-promo"><div className="promo-icon-circle"><FiBell /></div><div className="promo-content"><div className="promo-title">Choose your notifications</div><div className="promo-desc">Get notifications for messages, groups or your status. <span className="green-link">Choose now</span></div></div><FiX className="promo-close" /></div>
            <div className="settings-user-profile" onClick={() => setActiveSubPage('profile')}>
              <DefaultAvatar name={user.fullName || user.username} size={82} />
              <div className="user-profile-info"><div className="user-profile-name">{user.fullName || user.username}</div><div className="user-profile-about">{user.about || "Hey there! I am using WhatsApp."}</div></div>
            </div>
            <div className="settings-sync-box"><div className="sync-icon-circle">!</div><div className="sync-content"><div className="sync-title">Syncing paused</div><div className="sync-desc">Open WhatsApp on your phone</div></div></div>
            <div className="settings-menu">
              {settingsOptions.map((opt) => (
                <div key={opt.id} className={`settings-menu-item ${activeSubPage === opt.id ? 'active' : ''}`} onClick={() => setActiveSubPage(opt.id)}>
                  <div className="menu-icon-wrapper">{opt.icon}</div>
                  <div className="menu-text"><div className="menu-title">{opt.title}</div><div className="menu-desc">{opt.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-detail-view">{renderSubPage()}</div>
      </div>
      {showMediaModal && <MediaModal onClose={() => setShowMediaModal(false)} />}
    </div>
  );
};

export default Settings;
