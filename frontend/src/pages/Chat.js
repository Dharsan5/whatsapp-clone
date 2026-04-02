import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";
import NavSidebar from "../components/NavSidebar";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import MediaModal from "../components/MediaModal";
import "./Chat.css";

const Chat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const socketRef = useRef(null);
  const selectedUserRef = useRef(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  const getPreviewText = (msg) => {
    if (!msg) return "";
    switch (msg.messageType) {
      case "image": return "📷 Photo";
      case "video": return "📹 Video";
      case "document": return "📄 Document";
      case "location": return "📍 Location";
      default: return msg.content;
    }
  };

  useEffect(() => {
    if (!user) return;
    const backendUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace("/api", "");
    socketRef.current = io(backendUrl);
    socketRef.current.emit("user_online", user._id);
    socketRef.current.on("online_users", (onUsers) => setOnlineUsers(onUsers));
    socketRef.current.on("receive_message", (message) => {
      const senderId = message.sender._id;
      setLastMessages((prev) => ({ ...prev, [senderId]: { content: getPreviewText(message), createdAt: message.createdAt } }));
      if (selectedUserRef.current?._id === senderId) setMessages((prev) => [...prev, message]);
    });
    socketRef.current.on("message_delivered", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => m._id === messageId ? { ...m, delivered: true } : m)
      );
    });
    socketRef.current.on("messages_read", ({ from }) => {
      // from = the user whose messages were read (i.e. our sent messages to selectedUser)
      setMessages((prev) =>
        prev.map((m) =>
          m.sender?._id === user._id && m.receiver?._id === from
            ? { ...m, read: true, delivered: true }
            : m
        )
      );
    });
    socketRef.current.on("user_typing", ({ userId }) => setTypingUsers((prev) => prev.includes(userId) ? prev : [...prev, userId]));
    socketRef.current.on("user_stop_typing", ({ userId }) => setTypingUsers((prev) => prev.filter((id) => id !== userId)));
    return () => socketRef.current?.disconnect();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (err) { console.error(err); }
    };
    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (!user || users.length === 0) return;
    const fetchLastMessages = async () => {
      try {
        const res = await api.get("/messages/last-messages");
        const mapped = {};
        res.data.forEach((msg) => {
          const otherUserId = msg.sender._id === user._id ? msg.receiver._id : msg.sender._id;
          mapped[otherUserId] = { content: getPreviewText(msg), createdAt: msg.createdAt, isMine: msg.sender._id === user._id };
        });
        setLastMessages(mapped);
      } catch (err) { console.error(err); }
    };
    fetchLastMessages();
  }, [user, users]);

  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${selectedUser._id}`);
        setMessages(res.data);
        // Mark received messages as read
        if (socketRef.current && user) {
          socketRef.current.emit("messages_seen", {
            viewerId: user._id,
            senderId: selectedUser._id,
          });
        }
      } catch (err) { console.error(err); }
    };
    fetchMessages();
  }, [selectedUser]);

  const handleMessageSent = useCallback((message) => {
    const receiverId = message.receiver._id;
    setLastMessages((prev) => ({ ...prev, [receiverId]: { content: getPreviewText(message), createdAt: message.createdAt, isMine: true } }));
  }, []);

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div></div>;
  if (!user) return null;

  return (
    <div className="chat-page">
      <div className={`chat-container ${selectedUser ? "chat-open" : ""}`}>
        <NavSidebar onMediaClick={() => setShowMediaModal(true)} />
        <Sidebar users={users} selectedUser={selectedUser} onSelectUser={(u) => setSelectedUser(u)} onlineUsers={onlineUsers} lastMessages={lastMessages} typingUsers={typingUsers} />
        <ChatWindow selectedUser={selectedUser} messages={messages} setMessages={setMessages} socket={socketRef.current} onMessageSent={handleMessageSent} typingUsers={typingUsers} onBack={() => setSelectedUser(null)} />
      </div>

      {showMediaModal && <MediaModal onClose={() => setShowMediaModal(false)} />}
    </div>
  );
};

export default Chat;
