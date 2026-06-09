// src/hooks/useAuth.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { loginUser, registerUser, getCurrentUser, logoutUser } from "../api/authApi";

//  Helper: always converts any FastAPI error shape → readable string
const extractErrorMessage = (err) => {
  const detail = err.response?.data?.detail;

  if (!detail) return "Something went wrong. Please try again.";

  // FastAPI 422 — array of validation error objects
  // shape: [{ type, loc, msg, input }]
  if (Array.isArray(detail)) {
    const first = detail[0];
    const field = first.loc?.[first.loc.length - 1] ?? "field";
    const msg   = first.msg ?? "Invalid value";
    return `${field}: ${msg}`;
  }

  // FastAPI standard error — plain string
  if (typeof detail === "string") return detail;

  // FastAPI object error — e.g. { message: "..." }
  if (typeof detail === "object" && detail.message) return detail.message;

  return "An unexpected error occurred.";
};

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login 
  const login = async ({ username, password, role }) => {
    setLoading(true);
    setError(null);
    try {
      // 1. POST JSON to /api/auth/login → { access_token, refresh_token, token_type }
      const { access_token, refresh_token } = await loginUser({ username, password });

      // 2. Store tokens so interceptor can attach them immediately
      localStorage.setItem("token", access_token);
      localStorage.setItem("refresh_token", refresh_token); // store for later refresh

      // 3. Decode username directly from JWT token
      const tokenPayload = JSON.parse(atob(access_token.split(".")[1]));
      const user = {
        username: tokenPayload.username,
        role: tokenPayload.role,
      };
      // 4. Save to Zustand + localStorage
      setAuth(access_token, user, user.role || role);

      // 5. Role-based redirect
      navigate(user.role === "admin" ? "/admin/dashboard" : "/assessment");

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
      // Backend returns { message: "...", status: "success" }
      await registerUser(formData);

      // Redirect to login with success banner
      navigate("/login", {
        state: { message: "Account created! Please sign in." },
      });
    } catch (err) {
      setError(extractErrorMessage(err));   // always a clean string
    } finally {
      setLoading(false);
    }
  };  

  // Logout 
  const logout = async () => {
    await authApi.logout();  // notify backend 
    localStorage.removeItem("refresh_token");
    clearAuth();             // wipe Zustand + localStorage
    navigate("/login");
  };

  return { login, register, logout, loading, error, setError }; 
}