// src/api/authApi.js
import api from "../utils/axiosInstance";
import { ENDPOINTS } from "../utils/constants";

// Login 
export const loginUser = async ({ username, password }) => {
  const response = await api.post(ENDPOINTS.LOGIN, {
    username,   // matches UserLogin.username field
    password,   // matches UserLogin.password field
  });
  // response.data = { access_token, refresh_token, token_type: "bearer" }
  return response.data;
};

// Register 
export const registerUser = async (formData) => {
  const payload = {
    username:  formData.fullName,   // maps fullName → username
    password:  formData.password,
    ageGroup: formData.ageGroup,  
    privacyConsent: formData.agreeToTerms,
  };
  const response = await api.post(ENDPOINTS.REGISTER, payload);
  return response.data;
};

//GET CURRENT USER
export const getCurrentUser = async () => {
  const response = await api.get(ENDPOINTS.ME);
  // response.data = { username: "john", role: "student" }
  return response.data;
};

// Logout 
export const logoutUser = async () => {
  try {
    await api.post(ENDPOINTS.LOGOUT);
  } catch {
    // Swallow error — local logout always proceeds regardless
  }
};