import api from "@/features/services/authApi";

export const getActivities = () => api.get("/activities");
export const getActivityById = (id) => api.get(`/activities/${id}`);
export const createActivity = (data) => api.post("/activities", data);
export const updateActivity = (id, data) => api.put(`/activities/${id}`, data);
export const deleteActivity = (id) => api.delete(`/activities/${id}`);
