import { useState, useEffect } from "react";
import { deviceApi } from "../services/api";
import { socketService } from "../services/socket";
import toast from "react-hot-toast";
const useDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await deviceApi.getAll();
      const normalized = response.data.map((d) => ({ ...d, id: d.id || d._id }));
      setDevices(normalized);
      setError(null);
    } catch (err) {
      setError("Failed to fetch devices");
      toast.error("Failed to load devices");
    } finally {
      setLoading(false);
    }
  };
  const toggleDevice = async (deviceId) => {
    let previousDevice = null;
    setDevices((prev) => prev.map((device) => {
      const idMatch = device.id === deviceId || device._id === deviceId;
      if (idMatch) {
        previousDevice = device;
        return { ...device, isOn: !device.isOn, powerConsumption: !device.isOn ? (Number(device.powerConsumption) || 0) + 50 : 0 };
      }
      return device;
    }));
    try {
      const response = await deviceApi.toggle(deviceId);
      const updated = { ...response.data, id: response.data.id || response.data._id };
      setDevices((prev) => prev.map((device) => {
        const idMatch = device.id === deviceId || device._id === deviceId;
        return idMatch ? updated : device;
      }));
      toast.success("Device toggled successfully");
    } catch (err) {
      if (previousDevice) {
        setDevices((prev) => prev.map((device) => {
          const idMatch = device.id === deviceId || device._id === deviceId;
          return idMatch ? previousDevice : device;
        }));
      }
      toast.error("Failed to toggle device");
    }
  };
  const updateSafetyLimits = async (deviceId, limits) => {
    try {
      const response = await deviceApi.updateSafetyLimits(deviceId, limits);
      const updated = { ...response.data, id: response.data.id || response.data._id };
      setDevices((prev) => prev.map((device) => {
        const idMatch = device.id === deviceId || device._id === deviceId;
        return idMatch ? updated : device;
      }));
      toast.success("Safety limits updated");
    } catch (err) {
      toast.error("Failed to update safety limits");
    }
  };
  useEffect(() => {
    fetchDevices();
    const handleDeviceUpdate = (updatedDevice) => {
      const normalized = { ...updatedDevice, id: updatedDevice.id || updatedDevice._id };
      setDevices((prev) => prev.map((device) => {
        const idMatch = device.id === normalized.id || device._id === normalized.id;
        return idMatch ? normalized : device;
      }));
    };
    const handleEspDiscovered = (payload) => {
      if (!payload) return;
      if (payload.registered && Array.isArray(payload.sockets)) {
        setDevices((prev) => {
          const next = [...prev];
          for (const s of payload.sockets) {
            const matchIndex = next.findIndex((d) => d.id === s.deviceId || d._id === s.deviceId || d.espId === payload.espId && d.socketIndex === s.socketIndex);
            const deviceObj = {
              id: s.deviceId || `${payload.espId}:${s.socketIndex}`,
              _id: s.deviceId,
              name: s.name || `ESP ${payload.espId} #${s.socketIndex}`,
              espId: payload.espId,
              socketIndex: s.socketIndex,
              isOn: !!s.isOn,
              wifiNetwork: payload.wifiNetwork || null,
              status: "online"
            };
            if (matchIndex >= 0) {
              next[matchIndex] = { ...next[matchIndex], ...deviceObj };
            } else {
              next.unshift(deviceObj);
            }
          }
          return next;
        });
      } else if (!payload.registered && payload.espId) {
        setDevices((prev) => {
          const exists = prev.some((d) => d.espId === payload.espId && !d.deviceId);
          if (exists) return prev;
          const newDevice = {
            id: `${payload.espId}:1`,
            name: `Unregistered ESP ${payload.espId}`,
            espId: payload.espId,
            socketIndex: 1,
            isOn: false,
            status: "online"
          };
          return [newDevice, ...prev];
        });
      }
    };
    const handleSensorReading = (reading) => {
      const { deviceId, current, voltage, power } = reading || {};
      if (!deviceId) return;
      setDevices((prev) => prev.map((device) => {
        const match = device.id === deviceId || device._id === deviceId || device.id === String(deviceId);
        if (!match) return device;
        const updated = {
          ...device,
          currentReading: typeof current === "number" ? current : device.currentReading,
          voltageReading: typeof voltage === "number" ? voltage : device.voltageReading,
          powerConsumption: typeof power === "number" ? power : device.powerConsumption,
          lastUpdated: /* @__PURE__ */ new Date()
        };
        return updated;
      }));
    };
    const handleSafetyAlert = (data) => {
      toast.error(`Safety Alert: ${data.type} exceeded on device ${data.deviceId}`);
    };
    socketService.on("device-update", handleDeviceUpdate);
    socketService.on("esp32-discovered", handleEspDiscovered);
    socketService.on("sensor-reading", handleSensorReading);
    socketService.on("safety-alert", handleSafetyAlert);
    return () => {
      socketService.off("device-update", handleDeviceUpdate);
      socketService.off("esp32-discovered", handleEspDiscovered);
      socketService.off("sensor-reading", handleSensorReading);
      socketService.off("safety-alert", handleSafetyAlert);
    };
  }, []);
  const addDevice = async (deviceData) => {
    if (!deviceData) {
      toast.error("No device data provided");
      return;
    }
    if (!deviceData.name || String(deviceData.name).trim().length < 3) {
      toast.error("Device name is required (min 3 characters)");
      return;
    }
    if (!deviceData.espId || String(deviceData.espId).trim().length === 0) {
      toast.error("ESP ID is required. Make sure you selected or entered the ESP ID");
      return;
    }
    if (!deviceData.room || String(deviceData.room).trim().length === 0) {
      toast.error("Room is required");
      return;
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("You must be logged in to add a device");
      return;
    }
    try {
      const payload = { ...deviceData };
      if (payload.maxCurrent !== void 0) payload.maxCurrent = Number(payload.maxCurrent);
      if (payload.maxVoltage !== void 0) payload.maxVoltage = Number(payload.maxVoltage);
      const response = await deviceApi.create(payload);
      const respData = response.data;
      const normalized = { ...respData, id: respData.id || respData._id };
      setDevices((prev) => [normalized, ...prev]);
      toast.success("Device added successfully");
    } catch (err) {
      const anyErr = err;
      if (anyErr && anyErr.response && anyErr.response.data) {
        const data = anyErr.response.data;
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          toast.error(data.errors.join("; "));
          return;
        }
        if (data.error) {
          toast.error(String(data.error));
          return;
        }
      }
      toast.error("Failed to add device");
    }
  };
  return {
    devices,
    loading,
    error,
    toggleDevice,
    updateSafetyLimits,
    addDevice,
    refetch: fetchDevices
  };
};
export {
  useDevices
};
