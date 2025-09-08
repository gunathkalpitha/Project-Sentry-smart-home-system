import express from "express";
import axios from "axios";

const router = express.Router();

// Replace with your ESP32 local IP
const ESP32_BASE_URL = "http://192.168.4.1";

// GET /api/wifi/scan - available networks
router.get("/scan", async (req, res) => {
  try {
    const response = await axios.get(`${ESP32_BASE_URL}/scan`);
    res.json(response.data); // [{ ssid: 'Network1', rssi: -50 }, ...]
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Failed to scan Wi-Fi" });
  }
});

// GET /api/wifi/current - current connected network
router.get("/current", async (req, res) => {
  try {
    const response = await axios.get(`${ESP32_BASE_URL}/current`);
    res.json(response.data); // { ssid: 'YourWiFi' }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Failed to get current network" });
  }
});

// POST /api/wifi/connect - send SSID & password to ESP32
router.post("/connect", async (req, res) => {
  const { ssid, password } = req.body;
  if (!ssid || !password)
    return res.status(400).json({ message: "SSID & password required" });

  try {
    await axios.post(`${ESP32_BASE_URL}/connect`, { ssid, password });
    res.json({ message: "Credentials sent successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Failed to send Wi-Fi credentials" });
  }
});

export default router;
