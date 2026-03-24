import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiMoreVertical, FiLock } from "react-icons/fi";
import api from "../services/api";
import NavSidebar from "../components/NavSidebar";
import DefaultAvatar from "../components/DefaultAvatar";
import "./Status.css";

const Status = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Fetch all users for status list
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, [user]);

  // Generate mock time for status display
  const getRandomTime = (index) => {
    const times = [
      "Today at 3:08 pm",
      "Today at 1:54 pm",
      "Today at 10:14 am",
      "Today at 8:22 am",
      "Today at 5:59 am",
      "Today at 4:50 am",
      "Yesterday at 9:30 pm",
      "Yesterday at 6:15 pm",
    ];
    return times[index % times.length];
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="chat-page">
      <div className="chat-container">
        <NavSidebar activePage="status" />

        {/* Status sidebar */}
        <div className="status-sidebar">
          {/* Status header */}
          <div className="status-sidebar-header">
            <span className="status-sidebar-title">Status</span>
            <div className="status-sidebar-icons">
              <span className="status-header-icon" title="Add status">
                <FiPlus size={20} />
              </span>
              <span className="status-header-icon" title="More options">
                <FiMoreVertical size={20} />
              </span>
            </div>
          </div>

          {/* My status */}
          <div
            className={`status-item my-status ${selectedStatus === "my" ? "active" : ""}`}
            onClick={() => setSelectedStatus("my")}
          >
            <div className="status-avatar-wrapper my-status-avatar">
              <DefaultAvatar name={user?.username} size={50} />
              <span className="status-add-badge">
                <FiPlus size={12} />
              </span>
            </div>
            <div className="status-info">
              <div className="status-name">My status</div>
              <div className="status-time-text">Click to add status update</div>
            </div>
          </div>

          {/* Recent section */}
          {users.length > 0 && (
            <>
              <div className="status-section-label">Recent</div>
              {users.slice(0, 6).map((u, index) => (
                <div
                  key={u._id}
                  className={`status-item ${selectedStatus === u._id ? "active" : ""}`}
                  onClick={() => setSelectedStatus(u._id)}
                >
                  <div className="status-avatar-wrapper">
                    <div className="status-ring">
                      <DefaultAvatar name={u.username} size={44} />
                    </div>
                  </div>
                  <div className="status-info">
                    <div className="status-name">{u.username}</div>
                    <div className="status-time-text">{getRandomTime(index)}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Viewed section */}
          {users.length > 6 && (
            <>
              <div className="status-section-label">Viewed</div>
              {users.slice(6).map((u, index) => (
                <div
                  key={u._id}
                  className={`status-item ${selectedStatus === u._id ? "active" : ""}`}
                  onClick={() => setSelectedStatus(u._id)}
                >
                  <div className="status-avatar-wrapper">
                    <div className="status-ring viewed">
                      <DefaultAvatar name={u.username} size={44} />
                    </div>
                  </div>
                  <div className="status-info">
                    <div className="status-name">{u.username}</div>
                    <div className="status-time-text">{getRandomTime(index + 6)}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Status detail panel */}
        <div className="status-detail">
          <div className="status-detail-content">
            {/* Status circle icon */}
            <div className="status-detail-icon">
              <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="#8696a0" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
                <circle cx="12" cy="12" r="4" fill="#8696a0" stroke="none" />
              </svg>
            </div>
            <h2 className="status-detail-title">Share status updates</h2>
            <p className="status-detail-desc">
              Share photos, videos and text that disappear after 24 hours.
            </p>
            <div className="status-detail-encrypted">
              <FiLock size={13} />
              <span>Your status updates are end-to-end encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Status;
