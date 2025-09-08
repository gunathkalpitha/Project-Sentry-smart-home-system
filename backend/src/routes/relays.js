import express from 'express';
import Relay from '../models/Relay.js';
import Device from '../models/Device.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { deviceId } = req.query;
  const q = deviceId ? { deviceId } : {};
  const relays = await Relay.find(q);
  res.json(relays);
});

router.post('/toggle', requireAuth, async (req, res) => {
  const { deviceId, channel, state } = req.body;
  if (!deviceId || !channel) return res.status(400).json({ message: 'deviceId & channel required' });
  // ensure device exists
  await Device.findById(deviceId);
  const relay = await Relay.findOneAndUpdate(
    { deviceId, channel },
    { deviceId, channel, state: !!state },
    { new: true, upsert: true }
  );
  // Emit change to clients (ESP can listen via WebSocket or poll)
  const io = req.app.get('io');
  io.emit('relay:update', { deviceId, channel, state: relay.state });
  res.json(relay);
});

export default router;
