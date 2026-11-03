import api from "./api";

// GET /api/stats -> dashboard numbers
export const getStats = () => api.get("/stats");
