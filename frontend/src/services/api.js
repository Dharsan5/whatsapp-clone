import axios from "axios";

// Create an axios instance with base URL
// Every call like api.get("/users") automatically becomes
// "http://localhost:5000/api/users"
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Interceptor — runs BEFORE every request
// Automatically attaches the JWT token to every request
// So you don't have to manually add { headers: { Authorization: ... } } every time
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
