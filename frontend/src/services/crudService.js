import api from "./api";

// One tiny service per module:  const volunteers = createCrudService("volunteers");
// Every call resolves to the backend body: { success, message, data }
export const createCrudService = (path) => ({
  list: (params) => api.get(`/${path}`, { params }),
  get: (id) => api.get(`/${path}/${id}`),
  create: (body) => api.post(`/${path}`, body),
  update: (id, body) => api.put(`/${path}/${id}`, body),
  remove: (id) => api.delete(`/${path}/${id}`),
});
