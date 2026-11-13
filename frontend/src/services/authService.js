import api from "./api";

export const authService = {
  // Sign in with email and password
  login: (credentials) => api.post("/auth/login", credentials),

  // Register a new user account
  register: (userData) => api.post("/auth/register", userData),

  // Get currently authenticated user profile
  getMe: () => api.get("/auth/me"),

  // Update profile details (e.g. fullName)
  updateProfile: (data) => api.put("/auth/profile", data),

  // Change current user's password
  changePassword: (data) => api.put("/auth/change-password", data),
};
