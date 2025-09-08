import express from 'express';
import Device from '../models/Device.js';
import Reading from '../models/Reading.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// ESP posts readings (no auth for simplicity; optionally add device token)
router.post('/ingest', async (req, res) => {
  try {
    const { espId, voltage, current, power, temperature, humidity } = req.body;
    let device = await Device.findOne({ espId });
    if (!device) device = await Device.create({ name: espId || 'ESP32', espId, online: true });
    const reading = await Reading.create({ deviceId: device._id, voltage, current, power, temperature, humidity });
    // Emit via socket
    const io = req.app.get('io');
    io.emit('reading:new', { deviceId: String(device._id), reading });
    res.status(201).json(reading);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Authenticated clients fetch latest readings
router.get('/latest', requireAuth, async (req, res) => {
  const { deviceId, limit = 50 } = req.query;
  const q = deviceId ? { deviceId } : {};
  const data = await Reading.find(q).sort({ createdAt: -1 }).limit(Number(limit));
  res.json(data);
});

export default router;
