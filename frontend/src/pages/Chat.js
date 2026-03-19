import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import "./Chat.css";

const Chat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);          // All other users
  const [selectedUser, setSelectedUser] = useState(null); // Currently chatting with
  const [messages, setMessages] = useState([]);    // Messages in current chat
  const [onlineUsers, setOnlineUsers] = useState([]); // Who is online
  const socketRef = useRef(null);                  // Socket.IO connection reference

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Initialize Socket.IO connection when user logs in
  useEffect(() => {
    if (!user) return;

    // Connect to the backend Socket.IO server
    socketRef.current = io("http://localhost:5000");

    // Tell the server "I'm online" by sending my user ID
    socketRef.current.emit("user_online", user._id);

    // Listen for online users updates
    socketRef.current.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    // Listen for incoming messages from other users
    socketRef.current.on("receive_message", (message) => {
      // Only add the message if it's from the user we're currently chatting with
      // (we use a callback form of setState to access the latest selectedUser)
      setMessages((prev) => [...prev, message]);
    });

    // Cleanup — disconnect socket when component unmounts (logout, page close)
    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  // Fetch all users on mount
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

  // Fetch messages when a user is selected
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${selectedUser._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  // Handle selecting a user from the sidebar
  const handleSelectUser = (u) => {
    setSelectedUser(u);
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
        <Sidebar
          users={users}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          onlineUsers={onlineUsers}
        />
        <ChatWindow
          selectedUser={selectedUser}
          messages={messages}
          setMessages={setMessages}
          socket={socketRef.current}
        />
      </div>
    </div>
  );
};

export default Chat;
