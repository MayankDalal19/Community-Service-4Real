import axios from "axios";

// One centralized Axios instance. Every request in the app goes through this,
// so base URL, timeout, headers (and later the JWT token) live in ONE place.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: automatically attach Authorization header if token exists
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

// Success: unwrap Axios so callers receive the backend body directly:
//   { success: true, message: "...", data: {...} }
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message;

    if (error.response) {
      // Server answered with an error status (4xx / 5xx) -> use our API message
      message = error.response.data?.message || `Request failed (${error.response.status})`;
    } else if (error.code === "ECONNABORTED") {
      message = "The server took too long to respond.";
    } else {
      // No response at all -> backend is off, wrong URL, or blocked by CORS
      message = "Cannot reach the API. Is the backend running on port 5000?";
    }

    return Promise.reject({
      message,
      status: error.response?.status || null,
    });
  }
);

export default api;
