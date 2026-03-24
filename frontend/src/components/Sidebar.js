import DefaultAvatar from "./DefaultAvatar";
import "./Sidebar.css";

const Sidebar = ({
  users,
  selectedUser,
  onSelectUser,
  onlineUsers,
  lastMessages,
  typingUsers,
}) => {
  // Format time for sidebar
  const formatSidebarTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < oneDay && date.getDate() === now.getDate()) {
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
      {/* Header — "WhatsApp" title with new chat + menu icons */}
      <div className="sidebar-header">
        <span className="sidebar-title">WhatsApp</span>
        <div className="sidebar-header-icons">
          {/* New chat icon */}
          <span className="header-icon" title="New chat">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </span>
          {/* Menu icon */}
          <span className="header-icon" title="Menu">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/>
            </svg>
          </span>
        </div>
      </div>

      {/* Search bar */}
      <div className="sidebar-search">
        <div className="search-wrapper">
          <span className="search-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z"/>
            </svg>
          </span>
          <input type="text" placeholder="Search or start a new chat" readOnly />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="sidebar-filters">
        <span className="filter-tab active">All</span>
        <span className="filter-tab">Unread</span>
        <span className="filter-tab">Groups</span>
      </div>

      {/* Chat list */}
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
                <DefaultAvatar name={u.username} size={50} />
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
