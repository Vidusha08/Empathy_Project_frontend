// src/api/authApi.js
import api from "../utils/axiosInstance";
import { ENDPOINTS } from "../utils/constants";
 
// Login
export const loginUser = async ({ username, password }) => {
  const response = await api.post(ENDPOINTS.LOGIN, {
    username, // matches backend's login field
    password,
  });
  // response.data = { message, access_token, student }
  return response.data;
};
 
// Register (legacy single-step; no longer used by RegistrationPage)
export const registerUser = async (formData) => {
  const payload = {
    username: formData.username,
    email: formData.email,
    gender: formData.gender,
    password: formData.password,
  };

  const response = await api.post(ENDPOINTS.REGISTER, payload);

  return response.data;
};

// NEW: Step 1 of sign-up. Checks the details and duplicates, saves nothing.
// Resolves with { valid: true }; rejects with 400/409 + { error } otherwise.
export const validateRegistration = async (formData) => {
  const payload = {
    username: formData.username,
    email: formData.email,
    gender: formData.gender,
    password: formData.password,
  };

  const response = await api.post(ENDPOINTS.REGISTER_VALIDATE, payload);

  return response.data;
};

// NEW: Final step. Saves the account + screening + pre-skill answers together.
// payload = { username, email, gender, password, screening, pre_skill }
// Resolves with { message, tier, acute } (no scores, no token).
export const completeRegistration = async (payload) => {
  const response = await api.post(ENDPOINTS.REGISTER_COMPLETE, payload);

  return response.data;
};
 
// GET CURRENT USER
export const getCurrentUser = async () => {
  const response = await api.get(ENDPOINTS.ME);
  // response.data = { student: { id, name, username, email } }
  return response.data;
};
 
// Logout
export const logoutUser = async () => {
  try {
    await api.post(ENDPOINTS.LOGOUT);
  } catch {
    // The backend has no /api/auth/logout route right now, so this will
    // 404 — swallowed on purpose. Local logout (clearing the token) always
    // proceeds regardless.
  }
};

/*import api from "../utils/axiosInstance";
import { ENDPOINTS } from "../utils/constants";
 
// Login
export const loginUser = async ({ username, password }) => {
  const response = await api.post(ENDPOINTS.LOGIN, {
    username, // matches backend's login field
    password,
  });
  // response.data = { message, access_token, student }
  return response.data;
};
 
// Register
export const registerUser = async (formData) => {
  const payload = {
    username: formData.username,
    email: formData.email,
    gender: formData.gender,
    password: formData.password,
  };

  const response = await api.post(ENDPOINTS.REGISTER, payload);

  return response.data;
};
 
// GET CURRENT USER
export const getCurrentUser = async () => {
  const response = await api.get(ENDPOINTS.ME);
  // response.data = { student: { id, name, username, email } }
  return response.data;
};
 
// Logout
export const logoutUser = async () => {
  try {
    await api.post(ENDPOINTS.LOGOUT);
  } catch {
    // The backend has no /api/auth/logout route right now, so this will
    // 404 — swallowed on purpose. Local logout (clearing the token) always
    // proceeds regardless.
  }
};
*/