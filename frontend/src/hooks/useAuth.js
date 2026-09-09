// src/hooks/useAuth.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { loginUser, registerUser, logoutUser } from "../api/authApi";
 
// Converts the Flask backend's error shape ({ error: "..." }) into a
// readable string. (Previously written for a FastAPI backend's
// { detail: ... } shape, which this backend doesn't use.)
const extractErrorMessage = (err) => {
  const message = err.response?.data?.error;
  if (typeof message === "string" && message.length > 0) return message;
  return "Something went wrong. Please try again.";
};
 
export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  // Login
  const login = async ({ username, password }) => {
    setLoading(true);
    setError(null);
    try {
      // Backend returns { message, access_token, student }
      const { access_token, student } = await loginUser({ username, password });
 
      localStorage.setItem("token", access_token);
 
      // setAuth's real signature is (user, token) — order matters here.
      setAuth(student, access_token);
 
      // The backend has no role concept yet, so everyone lands on /chat.
      navigate("/chat");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
 
  // Register
  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // Backend returns { message, student, access_token } and logs the
      // student in immediately — no separate login step is needed.
      const { access_token, student } = await registerUser(formData);
 
      localStorage.setItem("token", access_token);
      setAuth(student, access_token);
 
      navigate("/login");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
 
  // Logout
  const logout = async () => {
    await logoutUser(); // notify backend (safe no-op if the route 404s)
    localStorage.removeItem("token");
    clearAuth(); // wipe Zustand + localStorage
    navigate("/login");
  };
 
  return { login, register, logout, loading, error, setError };
}