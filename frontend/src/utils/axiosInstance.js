import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. http://127.0.0.1:5000
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

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Requests where a 401 means "these credentials were wrong" rather than
// "your session expired" — these should NOT trigger the global redirect,
// or the login/register page never gets a chance to show its own error.
const AUTH_ENTRY_ROUTES = ["/auth/login", "/auth/register"];

// Response interceptor: handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isAuthEntryRequest = AUTH_ENTRY_ROUTES.some((path) =>
      requestUrl.includes(path)
    );

    if (error.response?.status === 401 && !isAuthEntryRequest) {
      // Clear both possible storage locations
      localStorage.removeItem("auth-storage");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

