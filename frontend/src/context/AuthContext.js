import { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (username, email, phoneNumber, password) => {
    const res = await api.post("/auth/register", {
      username,
      email,
      phoneNumber,
      password,
    });
    localStorage.setItem("user", JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const login = async (loginIdentifier, password) => {
    const res = await api.post("/auth/login", { loginIdentifier, password });
    localStorage.setItem("user", JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const updateProfile = async (formData) => {
    const res = await api.put("/auth/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const updatedUser = { ...user, ...res.data };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
