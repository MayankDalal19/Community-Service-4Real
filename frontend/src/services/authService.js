import api from "./api";

const TOKEN_KEY = "sahyog_token";
const USER_KEY = "sahyog_user";

export const authService = {
  /**
   * Log in with email and password
   */
  async login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    if (res.data?.token) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    }
    return res.data;
  },

  /**
   * Register a new user account
   */
  async register(data) {
    const res = await api.post("/auth/register", data);
    if (res.data?.token) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    }
    return res.data;
  },

  /**
   * Get current authenticated user profile
   */
  async getMe() {
    const res = await api.get("/auth/me");
    if (res.data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    }
    return res.data.user;
  },

  /**
   * Fetch roles list
   */
  async getRoles() {
    const res = await api.get("/auth/roles");
    return res.data;
  },

  /**
   * Get cached token
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get cached user
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Clear session
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export default authService;
