import api from "./api";

export const userService = {
  // List users with search and pagination (Admin only)
  getUsers: (params = {}) => api.get("/users", { params }),

  // Get single user details
  getUser: (id) => api.get(`/users/${id}`),

  // Get available system roles
  getRoles: () => api.get("/users/roles"),

  // Create a user with assigned role (Admin only)
  createUser: (data) => api.post("/users", data),

  // Update a user's role or status (Admin only)
  updateUser: (id, data) => api.put(`/users/${id}`, data),

  // Remove or deactivate user
  deleteUser: (id) => api.delete(`/users/${id}`),
};
