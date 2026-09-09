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
 
// Register
export const registerUser = async (formData) => {
  // The backend's /api/auth/register requires exactly these four fields.
  // ageGroup, gender, and agreeToTerms aren't accepted server-side (yet),
  // so they're intentionally left out of the payload.
  const payload = {
    name: formData.fullName,
    username: formData.username,
    email: formData.email,
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
