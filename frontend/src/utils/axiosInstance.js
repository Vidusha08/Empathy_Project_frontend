import axios from "axios";
 
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. http://localhost:8000
});
 
/**
 * Read the JWT access token from wherever authStore persists it.
 *
 * Zustand's `persist` middleware writes the entire store state as JSON
 * under the key "auth-storage", so the token lives at:
 *   auth-storage → state → token
 *
 * We also fall back to a bare "token" key in case the app ever writes
 * it directly (e.g. during login before Zustand hydrates).
 */
function getAccessToken() {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token;
      if (token) return token;
    }
  } catch {
    // JSON parse failed — fall through to bare key
  }
  // Bare fallback (used by login flow before Zustand rehydrates)
  return localStorage.getItem("token") ?? null;
}
 
// ── Request interceptor: attach Bearer token ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
 
// ── Response interceptor: handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Clear both possible storage locations
      localStorage.removeItem("auth-storage");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
 
export default api;
/*import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // FastAPI backend URL
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 (token expired)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;*/