import api from "./api";

// GET /api/health     -> is the Express API alive?
export const checkApi = () => api.get("/health");

// GET /api/health/db  -> can Express reach MongoDB Atlas? (also returns roles + user count)
export const checkDatabase = () => api.get("/health/db");

// GET /api/auth/me    -> validates the JWT token and active session
export const checkAuthSession = () => api.get("/auth/me");

