import axios from "axios";
const API_BASE = "http://localhost:3001/api";
const api = axios.create({
  baseURL: API_BASE,
  timeout: 1e4
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});
const deviceApi = {
  getAll: () => api.get("/devices"),
  getById: (id) => api.get(`/devices/${id}`),
  create: (device) => api.post("/devices", device),
  update: (id, device) => api.put(`/devices/${id}`, device),
  delete: (id) => api.delete(`/devices/${id}`),
  toggle: (id) => api.post(`/devices/${id}/toggle`),
  updateSafetyLimits: (id, limits) => api.put(`/devices/${id}/safety`, limits)
};
const sensorApi = {
  getReadings: (deviceId, period) => api.get(`/sensors/readings/${deviceId}?period=${period}`),
  getLatest: (deviceId) => api.get(`/sensors/latest/${deviceId}`),
  getSummary: (deviceId, period) => api.get(`/sensors/summary/${deviceId}?period=${period}`),
  getRecentSummary: (deviceId, seconds = 5) => api.get(`/sensors/recent-summary/${deviceId}?seconds=${seconds}`)
};
const roomApi = {
  getAll: () => api.get("/rooms"),
  create: (room) => api.post("/rooms", room),
  update: (id, room) => api.put(`/rooms/${id}`, room),
  delete: (id) => api.delete(`/rooms/${id}`)
};
const automationApi = {
  getAll: () => api.get("/automation"),
  create: (rule) => api.post("/automation", rule),
  update: (id, rule) => api.put(`/automation/${id}`, rule),
  delete: (id) => api.delete(`/automation/${id}`),
  toggle: (id) => api.post(`/automation/${id}/toggle`)
};
const wifiApi = {
  scan: async () => {
    const resp = await api.get("/wifi/scan");
    return resp.data;
  },
  status: async () => {
    const resp = await api.get("/wifi/status");
    return resp.data;
  },
  getConnectedDevices: async (ssid) => {
    const resp = await api.get(`/wifi/connected-devices?ssid=${encodeURIComponent(ssid)}`);
    return resp.data;
  },
  connect: async (ssid, password) => {
    const resp = await api.post("/wifi/connect", { ssid, password });
    return resp.data;
  },
  // Return last persisted credentials (if any). Useful to restore selected network on refresh.
  credentials: async () => {
    const resp = await api.get("/wifi/credentials");
    return resp.data;
  }
};
const reportApi = {
  getEnergyReport: (period) => api.get(`/reports/energy?period=${period}`),
  downloadReport: (period, format) => api.get(`/reports/download?period=${period}&format=${format}`, { responseType: "blob" })
};
const raspberryPiApi = {
  getAll: () => api.get("/raspberrypi"),
  getById: (id) => api.get(`/raspberrypi/${id}`),
  create: (pi) => api.post("/raspberrypi", pi),
  update: (id, pi) => api.put(`/raspberrypi/${id}`, pi),
  delete: (id) => api.delete(`/raspberrypi/${id}`),
  heartbeat: (piId, data) => api.post(`/raspberrypi/${piId}/heartbeat`, data),
  scanESP: (id) => api.post(`/raspberrypi/${id}/scan-esp`)
};
export {
  api,
  automationApi,
  deviceApi,
  raspberryPiApi,
  reportApi,
  roomApi,
  sensorApi,
  wifiApi
};
