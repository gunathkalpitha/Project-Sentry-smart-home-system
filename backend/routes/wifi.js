const express = require("express");
const router = express.Router();
const { scanNetworks, connectToNetwork } = require('../utils/wifi');
const WiFiNetwork = require('../models/WiFiNetwork');
const Device = require('../models/Device');

// In-memory store for last credentials (simple approach for demo/testing)
let lastCredentials = null;

// GET /api/wifi/scan - Scan for WiFi networks
router.get('/scan', async (req, res) => {
  try {
    const networks = await scanNetworks();
    res.json({ networks });
  } catch (err) {
    console.error('WiFi scan error:', err);
    res.status(500).json({ error: 'Failed to scan WiFi networks' });
  }
});

// POST /api/wifi/connect - Connect to WiFi network and emit credentials to ESPs
router.post('/connect', async (req, res) => {
  const { ssid, password } = req.body;
  if (!ssid || typeof password !== 'string') {
    return res.status(400).json({ error: 'SSID and password are required' });
  }
  try {
  // Store credentials so ESPs can poll them
  lastCredentials = { ssid, password, timestamp: new Date() };

  // Persist credentials to DB (for demo; in prod encrypt or don't store passwords in plaintext)
  await WiFiNetwork.findOneAndUpdate({ ssid }, { $set: { ssid, password, lastConnectedAt: new Date() } }, { upsert: true });

  // Upsert network into DB
  await WiFiNetwork.findOneAndUpdate({ ssid }, { $set: { lastConnectedAt: new Date() } }, { upsert: true });

  await connectToNetwork(ssid, password);
    // Emit credentials to ESPs via Socket.IO
      if (req.io) {
        req.io.emit('wifi-credentials', { ssid, password });

        // For demo convenience: mark all devices that already have this SSID as online
        // so the UI reflects the 'connected' state immediately.
        await Device.updateMany({ wifiNetwork: ssid }, { $set: { status: 'online', lastUpdated: new Date() } });

        // Emit wifi-connected list for this SSID to all users who have devices on it
        const connected = await Device.find({ wifiNetwork: ssid, status: 'online' }).select('espId userId');
        const byUser = {};
        connected.forEach(d => {
          const uid = d.userId.toString();
          if (!byUser[uid]) byUser[uid] = [];
          byUser[uid].push(d.espId);
        });
        for (const uid of Object.keys(byUser)) {
          req.io.to(`user_${uid}`).emit('wifi-connected', byUser[uid]);
        }
      }
    res.json({ message: 'Connected to WiFi and credentials saved & sent to ESPs' });
  } catch (err) {
    console.error('WiFi connect error:', err);
    res.status(500).json({ error: 'Failed to connect to WiFi', details: err.message });
  }
});

// GET /api/wifi/credentials - Return last saved credentials for ESP polling
router.get('/credentials', (req, res) => {
  if (lastCredentials) {
    return res.json(lastCredentials);
  }

  // Fallback: return most recent stored credentials from DB
  WiFiNetwork.findOne().sort({ lastConnectedAt: -1 }).then(doc => {
    if (!doc) return res.status(404).json({ error: 'No credentials available' });
    res.json({ ssid: doc.ssid, password: doc.password, timestamp: doc.lastConnectedAt });
  }).catch(err => {
    console.error('Error fetching credentials from DB', err);
    res.status(500).json({ error: 'Failed to fetch credentials' });
  });
});

// GET /api/wifi/connected-devices?ssid=SSID - return devices on this SSID and online
router.get('/connected-devices', async (req, res) => {
  const ssid = req.query.ssid;
  if (!ssid) return res.status(400).json({ error: 'ssid query param required' });
  try {
    const devices = await Device.find({ wifiNetwork: ssid, status: 'online' }).select('name espId isOn currentReading voltageReading socketIndex');
    res.json({ devices });
  } catch (error) {
    console.error('Error fetching connected devices:', error);
    res.status(500).json({ error: 'Failed to fetch connected devices' });
  }
});


// GET /api/wifi/status - Return current WiFi connection status
router.get('/status', async (req, res) => {
  const wifi = require('node-wifi');
  wifi.init({ iface: null });
  wifi.getCurrentConnections((err, current) => {
    if (err) {
      console.error('WiFi status error:', err);
      return res.status(500).json({ error: 'Failed to get WiFi status' });
    }
    res.json({ current });
  });
});

module.exports = router;
