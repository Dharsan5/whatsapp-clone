import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import DefaultAvatar from "./DefaultAvatar";
import { FiImage, FiSettings } from "react-icons/fi";
import "./NavSidebar.css";

// WhatsApp Web accurate SVG icons
const StatusIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 20c-4.963 0-9-4.037-9-9s4.037-9 9-9 9 4.037 9 9-4.037 9-9 9zm0-15.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/>
  </svg>
);

const CommunitiesIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const NavSidebar = ({ activePage, onMediaClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = activePage || (
    location.pathname === "/status" ? "status" : 
    location.pathname === "/settings" ? "settings" : "chat"
  );

  const handleSettingsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/settings");
  };

  return (
    <div className="nav-sidebar">
      {/* TOP: Chat, Status, Communities */}
      <div className="nav-top">
        <div
          className={`nav-icon ${currentPage === "chat" ? "active" : ""}`}
          title="Chats"
          onClick={() => navigate("/chat")}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z"/>
          </svg>
        </div>

        <div
          className={`nav-icon ${currentPage === "status" ? "active" : ""}`}
          title="Status"
          onClick={() => navigate("/status")}
        >
          <StatusIcon />
        </div>

        <div className="nav-icon" title="Communities">
          <CommunitiesIcon />
        </div>
      </div>

      {/* BOTTOM: Media, Settings, Avatar */}
      <div className="nav-bottom">
        <div
          className="nav-icon"
          title="Media, Docs & Links"
          onClick={onMediaClick}
        >
          <FiImage size={24} />
        </div>

        <div
          className={`nav-icon ${currentPage === "settings" ? "active" : ""}`}
          title="Settings"
          onClick={handleSettingsClick}
        >
          <FiSettings size={24} />
        </div>

        <div className="nav-icon nav-profile" title={user?.username}>
          <DefaultAvatar name={user?.username} size={32} />
        </div>
      </div>
    </div>
  );
};

export default NavSidebar;
