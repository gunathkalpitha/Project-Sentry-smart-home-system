import { io } from "socket.io-client";
class SocketService {
  socket = null;
  listeners = /* @__PURE__ */ new Map();
  connect() {
    const getSocketUrl = () => {
      if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        if (hostname.includes("--5173--")) {
          const backendUrl = hostname.replace("--5173--", "--3001--");
          return `${protocol}//${backendUrl}`;
        }
        return "ws://localhost:3001";
      }
      return "ws://localhost:3001";
    };
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    this.socket = io(getSocketUrl(), {
      autoConnect: true,
      auth: token ? { token } : void 0
    });
    this.socket.on("connect", () => {
      console.log("Connected to server");
    });
    this.socket.on("device-update", (device) => {
      this.emit("device-update", device);
    });
    this.socket.on("device-updated", (device) => {
      const normalized = { ...device, id: device.id || device._id };
      this.emit("device-update", normalized);
      this.emit("device-updated", normalized);
    });
    this.socket.on("device-toggled", (device) => {
      const normalized = { ...device, id: device.id || device._id };
      this.emit("device-update", normalized);
      this.emit("device-toggled", normalized);
    });
    this.socket.on("sensor-reading", (reading) => {
      this.emit("sensor-reading", reading);
    });
    this.socket.on("device-status", (data) => {
      this.emit("device-status", data);
    });
    this.socket.on("safety-alert", (data) => {
      this.emit("safety-alert", data);
    });
    this.socket.on("esp32-discovered", (data) => {
      this.emit("esp32-discovered", data);
    });
    this.socket.on("wifi-connected", (data) => {
      this.emit("wifi-connected", data);
    });
    return this.socket;
  }
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }
  sendCommand(deviceId, command, params) {
    if (this.socket) {
      this.socket.emit("device-command", { deviceId, command, params });
    }
  }
}
const socketService = new SocketService();
export {
  socketService
};
