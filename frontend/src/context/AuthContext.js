import { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

// Create the context — like a "box" that holds the logged-in user data
const AuthContext = createContext();

// Custom hook — instead of writing useContext(AuthContext) everywhere,
// just write useAuth() — cleaner and shorter
export const useAuth = () => useContext(AuthContext);

// Provider component — wraps the entire app and provides auth data to all children
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if user was previously logged in
  // localStorage persists even after closing the browser
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Register function — called from the Register page
  const register = async (username, email, password) => {
    const res = await api.post("/auth/register", {
      username,
      email,
      password,
    });
    // Save user data + token to localStorage and state
    localStorage.setItem("user", JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  // Login function — called from the Login page
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("user", JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  // Logout — clear everything
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
