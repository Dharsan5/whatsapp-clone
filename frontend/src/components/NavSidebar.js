import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import DefaultAvatar from "./DefaultAvatar";
import { FiImage, FiSettings, FiLogOut } from "react-icons/fi";
import "./NavSidebar.css";

const NavSidebar = ({ activePage, onMediaClick }) => {
  const { user, logout } = useAuth();
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

  const handleLogoutClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  return (
    <div className="nav-sidebar">
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
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        
        <div 
          className="nav-icon" 
          title="Media, Docs & Links"
          onClick={onMediaClick}
        >
          <FiImage size={24} />
        </div>

        <div className="nav-icon" title="Channels">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
      </div>

      <div className="nav-bottom">
        <div 
          className={`nav-icon ${currentPage === "settings" ? "active" : ""}`}
          title="Settings" 
          onClick={handleSettingsClick}
        >
          <FiSettings size={24} />
        </div>
        <div className="nav-icon" title="Logout" onClick={handleLogoutClick}>
          <FiLogOut size={24} />
        </div>
        <div className="nav-icon nav-profile" title={user?.username}>
          <DefaultAvatar name={user?.username} size={32} />
        </div>
      </div>
    </div>
  );
};

export default NavSidebar;
