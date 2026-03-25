import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  FiX, FiInfo, FiKey, FiLock, FiMessageSquare, 
  FiBell, FiCommand, FiHelpCircle, FiUser, FiArrowLeft, 
  FiCamera, FiEdit2, FiCheck, FiMoon, FiImage, FiSettings, FiChevronDown
} from "react-icons/fi";
import NavSidebar from "../components/NavSidebar";
import DefaultAvatar from "../components/DefaultAvatar";
import MediaModal from "../components/MediaModal";
import "./Settings.css";

// Inline SVG to avoid broken icon rendering
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z"/>
  </svg>
);


// Reusable Toggle Switch
const Toggle = ({ checked, onChange }) => (
  <label className="toggle-switch">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="toggle-slider" />
  </label>
);

// Reusable Select Dropdown
const SelectField = ({ value, options, onChange }) => (
  <div className="select-wrapper">
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <FiChevronDown className="select-chevron" />
  </div>
);

const Settings = () => {
  const { user, loading, updateProfile } = useAuth();
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubPage, setActiveSubPage] = useState(null);
  const [showPromo, setShowPromo] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState(user?.fullName || "");
  const [editAbout, setEditAbout] = useState(user?.about || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  // Chat Settings
  const [enterToSend, setEnterToSend] = useState(true);
  const [showPreviews, setShowPreviews] = useState(true);
  const [theme, setTheme] = useState("Dark");

  // Privacy Settings
  const [lastSeen, setLastSeen] = useState("Everyone");
  const [profilePhoto, setProfilePhoto] = useState("Everyone");
  const [status, setStatus] = useState("My contacts");
  const [readReceipts, setReadReceipts] = useState(true);
  const [messageTimer, setMessageTimer] = useState("Off");

  // Notification Settings
  const [notifSounds, setNotifSounds] = useState(true);
  const [desktopAlerts, setDesktopAlerts] = useState(true);
  const [groupSounds, setGroupSounds] = useState(true);

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
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) { alert("Failed to update profile"); }
  };

  const settingsOptions = [
    { id: 'account',       icon: <FiKey />,         title: "Account",             desc: "Security notifications, account info" },
    { id: 'privacy',       icon: <FiLock />,        title: "Privacy",             desc: "Blocked contacts, disappearing messages" },
    { id: 'chats',         icon: <FiMessageSquare />, title: "Chats",             desc: "Theme, wallpaper, chat settings" },
    { id: 'notifications', icon: <FiBell />,         title: "Notifications",       desc: "Messages, groups, sounds" },
    { id: 'keyboard',      icon: <FiCommand />,      title: "Keyboard shortcuts",  desc: "Quick actions" },
    { id: 'help',          icon: <FiHelpCircle />,   title: "Help",               desc: "Help center, contact us, privacy policy" },
    { id: 'profile',       icon: <FiUser />,         title: "Profile",            desc: "Name, about, photo" },
  ];

  const visibilityOptions = ["Everyone", "My contacts", "My contacts except...", "Nobody"];

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
              {saveSuccess && <div className="save-toast">✓ Profile saved!</div>}
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
              <div className="settings-divider">Appearance</div>
              <div className="settings-item">
                <div className="settings-icon"><FiMoon /></div>
                <div className="settings-text">Theme</div>
                <SelectField value={theme} options={["Dark", "Light", "System default"]} onChange={setTheme} />
              </div>
              <div className="settings-item">
                <div className="settings-icon"><FiImage /></div>
                <div className="settings-text">Chat wallpaper</div>
                <div className="settings-value">Default</div>
              </div>
              <div className="settings-divider">Display</div>
              <div className="settings-item-check">
                <div className="settings-text">
                  <div className="item-title">Enter is send</div>
                  <div className="item-desc">Press Enter to send messages</div>
                </div>
                <Toggle checked={enterToSend} onChange={() => setEnterToSend(v => !v)} />
              </div>
              <div className="settings-item-check">
                <div className="settings-text">
                  <div className="item-title">Show message previews</div>
                  <div className="item-desc">Show preview text in notifications</div>
                </div>
                <Toggle checked={showPreviews} onChange={() => setShowPreviews(v => !v)} />
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="subpage-container">
            <div className="subpage-header"><FiArrowLeft className="back-icon" onClick={() => setActiveSubPage(null)} /><h2>Privacy</h2></div>
            <div className="settings-list">
              <div className="settings-divider">Who can see my personal info</div>
              <div className="settings-item">
                <div className="settings-text">Last seen and online</div>
                <SelectField value={lastSeen} options={visibilityOptions} onChange={setLastSeen} />
              </div>
              <div className="settings-item">
                <div className="settings-text">Profile photo</div>
                <SelectField value={profilePhoto} options={visibilityOptions} onChange={setProfilePhoto} />
              </div>
              <div className="settings-item">
                <div className="settings-text">Status</div>
                <SelectField value={status} options={visibilityOptions} onChange={setStatus} />
              </div>
              <div className="settings-item-check">
                <div className="settings-text">
                  <div className="item-title">Read receipts</div>
                  <div className="item-desc">If turned off, you won't send or receive read receipts</div>
                </div>
                <Toggle checked={readReceipts} onChange={() => setReadReceipts(v => !v)} />
              </div>
              <div className="settings-divider">Disappearing messages</div>
              <div className="settings-item">
                <div className="settings-text">Default message timer</div>
                <SelectField value={messageTimer} options={["Off", "24 hours", "7 days", "90 days"]} onChange={setMessageTimer} />
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="subpage-container">
            <div className="subpage-header"><FiArrowLeft className="back-icon" onClick={() => setActiveSubPage(null)} /><h2>Account</h2></div>
            <div className="settings-list">
              <div className="settings-item clickable-item">
                <div className="settings-icon"><FiBell /></div>
                <div className="settings-text">Security notifications</div>
                <div className="settings-value">›</div>
              </div>
              <div className="settings-item clickable-item">
                <div className="settings-icon"><FiKey /></div>
                <div className="settings-text">Two-step verification</div>
                <div className="settings-value">›</div>
              </div>
              <div className="settings-item clickable-item">
                <div className="settings-icon"><FiInfo /></div>
                <div className="settings-text">Request account info</div>
                <div className="settings-value">›</div>
              </div>
              <div className="settings-item clickable-item">
                <div className="settings-text" style={{color: '#f15c6d'}}>Delete my account</div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="subpage-container">
            <div className="subpage-header"><FiArrowLeft className="back-icon" onClick={() => setActiveSubPage(null)} /><h2>Notifications</h2></div>
            <div className="settings-list">
              <div className="settings-divider">Messages</div>
              <div className="settings-item-check">
                <div className="settings-text">
                  <div className="item-title">Notification sounds</div>
                  <div className="item-desc">Play a sound for new messages</div>
                </div>
                <Toggle checked={notifSounds} onChange={() => setNotifSounds(v => !v)} />
              </div>
              <div className="settings-item-check">
                <div className="settings-text">
                  <div className="item-title">Desktop alerts</div>
                  <div className="item-desc">Show desktop notifications</div>
                </div>
                <Toggle checked={desktopAlerts} onChange={() => setDesktopAlerts(v => !v)} />
              </div>
              <div className="settings-divider">Groups</div>
              <div className="settings-item-check">
                <div className="settings-text">
                  <div className="item-title">Group notification sounds</div>
                  <div className="item-desc">Play a sound for group messages</div>
                </div>
                <Toggle checked={groupSounds} onChange={() => setGroupSounds(v => !v)} />
              </div>
            </div>
          </div>
        );

      case 'keyboard':
        return (
          <div className="subpage-container">
            <div className="subpage-header"><FiArrowLeft className="back-icon" onClick={() => setActiveSubPage(null)} /><h2>Keyboard shortcuts</h2></div>
            <div className="shortcuts-list">
              {[
                ["Mark as unread", "Ctrl + Alt + Shift + U"],
                ["Mute chat", "Ctrl + Alt + Shift + M"],
                ["Archive chat", "Ctrl + Alt + Shift + E"],
                ["Delete chat", "Ctrl + Alt + Backspace"],
                ["Pin chat", "Ctrl + Alt + Shift + P"],
                ["New chat", "Ctrl + Alt + N"],
                ["Search chats", "Ctrl + F"],
              ].map(([label, shortcut]) => (
                <div className="shortcut-item" key={label}>
                  <span>{label}</span>
                  <kbd>{shortcut}</kbd>
                </div>
              ))}
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="subpage-container">
            <div className="subpage-header"><FiArrowLeft className="back-icon" onClick={() => setActiveSubPage(null)} /><h2>Help</h2></div>
            <div className="settings-list">
              <a className="settings-item clickable-item" href="https://faq.whatsapp.com" target="_blank" rel="noreferrer">
                <div className="settings-text">Help Center</div>
                <div className="settings-value">↗</div>
              </a>
              <a className="settings-item clickable-item" href="https://www.whatsapp.com/contact" target="_blank" rel="noreferrer">
                <div className="settings-text">Contact us</div>
                <div className="settings-value">↗</div>
              </a>
              <a className="settings-item clickable-item" href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noreferrer">
                <div className="settings-text">Terms and Privacy Policy</div>
                <div className="settings-value">↗</div>
              </a>
              <div className="settings-item">
                <div className="settings-text" style={{color: '#8696a0', fontSize: 13}}>WhatsApp Clone v1.0.0</div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="settings-empty-state">
            <div className="empty-gear-icon"><FiSettings size={80} color="#2a3942" /></div>
            <h2>Settings</h2>
            <p className="empty-state-hint">Select an option from the left panel</p>
          </div>
        );
    }
  };

  const filteredOptions = settingsOptions.filter(opt =>
    searchQuery === "" ||
    opt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-page">
      <div className="chat-container">
        <NavSidebar activePage="settings" onMediaClick={() => setShowMediaModal(true)} />

        <div className="settings-sidebar">
          <div className="settings-header"><h3>Settings</h3></div>
          <div className="settings-search">
            <div className="search-wrapper">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search settings"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && <FiX className="search-clear" onClick={() => setSearchQuery("")} />}
            </div>
          </div>
          <div className="settings-scroll-area">
            {showPromo && (
              <div className="settings-promo">
                <div className="promo-icon-circle"><FiBell /></div>
                <div className="promo-content">
                  <div className="promo-title">Choose your notifications</div>
                  <div className="promo-desc">
                    Get notifications for messages, groups or your status.{" "}
                    <span className="green-link" onClick={() => setActiveSubPage('notifications')}>Choose now</span>
                  </div>
                </div>
                <FiX className="promo-close" onClick={() => setShowPromo(false)} />
              </div>
            )}
            <div className="settings-user-profile" onClick={() => setActiveSubPage('profile')}>
              <DefaultAvatar name={user.fullName || user.username} size={82} />
              <div className="user-profile-info">
                <div className="user-profile-name">{user.fullName || user.username}</div>
                <div className="user-profile-about">{user.about || "Hey there! I am using WhatsApp."}</div>
              </div>
            </div>
            <div className="settings-sync-box">
              <div className="sync-icon-circle">!</div>
              <div className="sync-content">
                <div className="sync-title">Syncing paused</div>
                <div className="sync-desc">Open WhatsApp on your phone</div>
              </div>
            </div>
            <div className="settings-menu">
              {filteredOptions.map((opt) => (
                <div key={opt.id} className={`settings-menu-item ${activeSubPage === opt.id ? 'active' : ''}`} onClick={() => setActiveSubPage(opt.id)}>
                  <div className="menu-icon-wrapper">{opt.icon}</div>
                  <div className="menu-text">
                    <div className="menu-title">{opt.title}</div>
                    <div className="menu-desc">{opt.desc}</div>
                  </div>
                </div>
              ))}
              {filteredOptions.length === 0 && searchQuery && (
                <div className="no-search-result">No results for "{searchQuery}"</div>
              )}
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
