import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const Sidebar = ({ users, selectedUser, onSelectUser, onlineUsers }) => {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      {/* Header — shows logged-in user's name + logout button */}
      <div className="sidebar-header">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <span className="sidebar-username">{user?.username}</span>
        </div>
        <button className="logout-btn" onClick={logout} title="Logout">
          ⏻
        </button>
      </div>

      {/* Search bar (visual only for now) */}
      <div className="sidebar-search">
        <input type="text" placeholder="Search or start new chat" readOnly />
      </div>

      {/* User list */}
      <div className="sidebar-chats">
        {users.map((u) => (
          <div
            key={u._id}
            className={`chat-item ${
              selectedUser?._id === u._id ? "active" : ""
            }`}
            onClick={() => onSelectUser(u)}
          >
            <div className="chat-avatar">
              {u.username.charAt(0).toUpperCase()}
            </div>
            <div className="chat-info">
              <div className="chat-name">{u.username}</div>
              <div className="chat-status">
                {onlineUsers.includes(u._id) ? (
                  <span className="online-status">online</span>
                ) : (
                  <span className="offline-status">offline</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="no-users">No users found. Ask someone to register!</div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
