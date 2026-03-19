import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const Sidebar = ({
  users,
  selectedUser,
  onSelectUser,
  onlineUsers,
  lastMessages,
  typingUsers,
}) => {
  const { user, logout } = useAuth();

  // Format time for sidebar — "2:30 PM" or "Yesterday" or "3/15/2026"
  const formatSidebarTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < oneDay && date.getDate() === now.getDate()) {
      // Today — show time
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diff < 2 * oneDay) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      });
    }
  };

  // Sort users — those with recent messages come first
  const sortedUsers = [...users].sort((a, b) => {
    const aTime = lastMessages[a._id]?.createdAt;
    const bTime = lastMessages[b._id]?.createdAt;
    if (!aTime && !bTime) return 0;
    if (!aTime) return 1;
    if (!bTime) return -1;
    return new Date(bTime) - new Date(aTime);
  });

  return (
    <div className="sidebar">
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

      <div className="sidebar-search">
        <input type="text" placeholder="Search or start new chat" readOnly />
      </div>

      <div className="sidebar-chats">
        {sortedUsers.map((u) => {
          const lastMsg = lastMessages[u._id];
          const isTyping = typingUsers.includes(u._id);

          return (
            <div
              key={u._id}
              className={`chat-item ${
                selectedUser?._id === u._id ? "active" : ""
              }`}
              onClick={() => onSelectUser(u)}
            >
              <div className="chat-avatar">
                {u.username.charAt(0).toUpperCase()}
                {onlineUsers.includes(u._id) && (
                  <span className="online-dot"></span>
                )}
              </div>
              <div className="chat-info">
                <div className="chat-info-top">
                  <div className="chat-name">{u.username}</div>
                  {lastMsg && (
                    <span className="chat-time">
                      {formatSidebarTime(lastMsg.createdAt)}
                    </span>
                  )}
                </div>
                <div className="chat-preview">
                  {isTyping ? (
                    <span className="typing-text">typing...</span>
                  ) : lastMsg ? (
                    <span className="last-message">
                      {lastMsg.isMine && (
                        <span className="you-prefix">You: </span>
                      )}
                      {lastMsg.content.length > 35
                        ? lastMsg.content.substring(0, 35) + "..."
                        : lastMsg.content}
                    </span>
                  ) : (
                    <span className="no-message">Start a conversation</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {users.length === 0 && (
          <div className="no-users">
            No users found. Ask someone to register!
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
