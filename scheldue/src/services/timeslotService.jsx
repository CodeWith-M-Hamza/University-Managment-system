import api from "../Api";

const TimeSlotService = {
  getAll: () => api.get("time-slots/"),
  getById: (id) => api.get(`time-slots/${id}/`),
  create: (data) => api.post("time-slots/", data),
  update: (id, data) => api.put(`time-slots/${id}/`, data),
  patch: (id, data) => api.patch(`time-slots/${id}/`, data),
  delete: (id) => api.delete(`time-slots/${id}/`),
};

export default TimeSlotService;
