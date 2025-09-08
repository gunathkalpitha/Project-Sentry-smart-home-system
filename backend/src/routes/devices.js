import express from 'express';
import Device from '../models/Device.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Create or update device (by espId)
router.post('/', requireAuth, async (req, res) => {
  const { name, location, espId } = req.body;
  if (!name) return res.status(400).json({ message: 'name required' });
  const device = await Device.findOneAndUpdate(
    { espId },
    { name, location, espId, online: true },
    { new: true, upsert: true }
  );
  res.status(201).json(device);
});

router.get('/', requireAuth, async (_req, res) => {
  const devices = await Device.find().sort({ createdAt: -1 });
  res.json(devices);
});

export default router;
