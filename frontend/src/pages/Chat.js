import { useState, useEffect, useRef, useCallback } from "react";
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

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastMessages, setLastMessages] = useState({});  // { userId: { content, createdAt } }
  const [typingUsers, setTypingUsers] = useState([]);     // [userId, userId, ...]
  const socketRef = useRef(null);
  const selectedUserRef = useRef(null); // Track selected user for socket callbacks

  // Keep ref in sync with state (so socket callbacks see latest value)
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Initialize Socket.IO
  useEffect(() => {
    if (!user) return;

    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit("user_online", user._id);

    socketRef.current.on("online_users", (onUsers) => {
      setOnlineUsers(onUsers);
    });

    // Incoming message handler
    socketRef.current.on("receive_message", (message) => {
      const senderId = message.sender._id;

      // Update last message preview for this sender
      setLastMessages((prev) => ({
        ...prev,
        [senderId]: { content: message.content, createdAt: message.createdAt },
      }));

      // Only add to chat window if we're currently chatting with this sender
      if (selectedUserRef.current?._id === senderId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Typing indicator
    socketRef.current.on("user_typing", ({ userId }) => {
      setTypingUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      );
    });

    socketRef.current.on("user_stop_typing", ({ userId }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  // Fetch all users
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

  // Fetch last messages for all users (for sidebar preview)
  useEffect(() => {
    if (!user || users.length === 0) return;

    const fetchLastMessages = async () => {
      try {
        const res = await api.get("/messages/last-messages");
        const mapped = {};
        res.data.forEach((msg) => {
          // Figure out the OTHER user's ID
          const otherUserId =
            msg.sender._id === user._id ? msg.receiver._id : msg.sender._id;
          mapped[otherUserId] = {
            content: msg.content,
            createdAt: msg.createdAt,
            isMine: msg.sender._id === user._id,
          };
        });
        setLastMessages(mapped);
      } catch (err) {
        console.error("Failed to fetch last messages:", err);
      }
    };

    fetchLastMessages();
  }, [user, users]);

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

  const handleSelectUser = (u) => {
    setSelectedUser(u);
  };

  // Called when a message is sent — updates sidebar last message preview
  const handleMessageSent = useCallback((message) => {
    const receiverId = message.receiver._id;
    setLastMessages((prev) => ({
      ...prev,
      [receiverId]: {
        content: message.content,
        createdAt: message.createdAt,
        isMine: true,
      },
    }));
  }, []);

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
      <div className={`chat-container ${selectedUser ? "chat-open" : ""}`}>
        <Sidebar
          users={users}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          onlineUsers={onlineUsers}
          lastMessages={lastMessages}
          typingUsers={typingUsers}
        />
        <ChatWindow
          selectedUser={selectedUser}
          messages={messages}
          setMessages={setMessages}
          socket={socketRef.current}
          onMessageSent={handleMessageSent}
          typingUsers={typingUsers}
          onBack={() => setSelectedUser(null)}
        />
      </div>
    </div>
  );
};

export default Chat;
