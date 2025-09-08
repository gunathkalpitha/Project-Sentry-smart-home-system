import express from 'express';
import Reading from '../models/Reading.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', requireAuth, async (req, res) => {
  const { deviceId, from, to } = req.query;
  const q = {};
  if (deviceId) q.deviceId = deviceId;
  if (from || to) {
    q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);
  }
  const readings = await Reading.find(q).sort({ createdAt: 1 });
  const totalPower = readings.reduce((acc, r) => acc + (r.power || 0), 0);
  res.json({ count: readings.length, totalPower, from, to });
});

export default router;
