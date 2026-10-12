// src/hooks/useAuth.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  loginUser, registerUser, logoutUser,
  validateRegistration, completeRegistration,
} from "../api/authApi";

const extractErrorMessage = (err) => {
  const message = err.response?.data?.error;
  if (typeof message === "string" && message.length > 0) return message;
  return "Something went wrong. Please try again.";
};

// The only registration fields the backend needs (same data as before).
const pickRegistration = ({ username, email, password, gender }) => ({
  username, email, password, gender,
});

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async ({ username, password }) => {
    setLoading(true);
    setError(null);
    try {
      const { access_token, student } = await loginUser({ username, password });

      localStorage.setItem("token", access_token);
      setAuth(student, access_token);

      navigate("/dashboard");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Legacy single-step registration (no longer used by RegistrationPage).
  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
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

  // NEW: step 1 of sign-up. Returns true if the details are valid and unused.
  const checkRegistration = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await validateRegistration(pickRegistration(formData));
      return true;
    } catch (err) {
      setError(extractErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // NEW: final step. Throws Error(message) so the popups can show it.
  // payload = { ...registration fields, screening, pre_skill }
  const registerWithAssessments = async (payload) => {
    try {
      return await completeRegistration(payload);
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  };

  const logout = async () => {
    await logoutUser();
    localStorage.removeItem("token");
    clearAuth();
    navigate("/login");
  };

  return {
    login, register, logout,
    checkRegistration, registerWithAssessments,
    loading, error, setError,
  };
}
/*import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { loginUser, registerUser, logoutUser } from "../api/authApi";

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

  const login = async ({ username, password }) => {
    setLoading(true);
    setError(null);
    try {
      const { access_token, student } = await loginUser({ username, password });

      localStorage.setItem("token", access_token);
      setAuth(student, access_token);

      // Backend now returns `role` on the student object (student|admin).
      // Both roles land on the same route; DashboardPage renders
      // different content based on the stored role.
      navigate("/dashboard");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
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

  const logout = async () => {
    await logoutUser();
    localStorage.removeItem("token");
    clearAuth();
    navigate("/login");
  };

  return { login, register, logout, loading, error, setError };
}*/