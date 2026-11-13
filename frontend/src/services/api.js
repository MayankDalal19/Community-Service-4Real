import axios from "axios";

// One centralized Axios instance. Every request in the app goes through this,
// so base URL, timeout, headers, and the JWT token live in ONE place.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach JWT Bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sahyog_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwrap backend body and handle session expiration
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message;

    if (error.response) {
      // If 401 Unauthorized occurs on an authenticated route, clear expired token
      if (
        error.response.status === 401 &&
        !error.config?.url?.includes("/auth/login") &&
        !error.config?.url?.includes("/auth/register")
      ) {
        localStorage.removeItem("sahyog_token");
        localStorage.removeItem("sahyog_user");
        window.dispatchEvent(new Event("sahyog:auth_expired"));
      }

      // Server answered with an error status (4xx / 5xx) -> use backend message
      message = error.response.data?.message || `Request failed (${error.response.status})`;
    } else if (error.code === "ECONNABORTED") {
      message = "The server took too long to respond.";
    } else {
      // Backend is off, wrong URL, or blocked by CORS
      message = "Cannot reach the API. Is the backend running on port 5000?";
    }

    return Promise.reject({
      message,
      status: error.response?.status || null,
    });
  }
);

export default api;
