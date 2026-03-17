const express = require('express');
const router = express.Router();
const Device = require('../models/Device');

// ✅ Make sure this import is valid (fix path or name if needed)
const { validateDevice } = require('../middleware/validation');

// ✅ Protect routes with authentication if req.user is used
const { authenticateToken } = require('../middleware/auth');

// GET all devices
// This route will return the authenticated user's devices when a valid Bearer token
// is provided. If no token is present or it's invalid, return a public, limited
// listing of online devices to allow basic discovery in dev environments.
router.get('/', async (req, res) => {
  try {
    // Try to read token optionally
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // If token valid, return devices for that user
        const devices = await Device.find({ userId: decoded.id }).sort({ createdAt: -1 });
        return res.json(devices);
      } catch (err) {
        // Token invalid/expired - fall through to public listing
        console.warn('Optional token invalid for /api/devices:', err && err.message ? err.message : err);
      }
    }

    // Public fallback: return online devices with limited fields
    const publicDevices = await Device.find({ status: 'online' })
      .select('name espId status wifiNetwork powerConsumption currentReading voltageReading')
      .sort({ lastUpdated: -1 });
    return res.json(publicDevices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// GET specific device
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, userId: req.user.id });
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

// POST create device
// Note: perform inline validation and mapping to give clearer errors to the client
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Ensure authenticated user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Map possible frontend field names to model fields
    const payload = {
      name: req.body.name,
      type: req.body.type || 'outlet',
      room: req.body.room || req.body.location || 'Unspecified',
      espId: req.body.espId,
      socketIndex: req.body.socketIndex !== undefined ? Number(req.body.socketIndex) : 1,
      maxCurrent: req.body.maxCurrent !== undefined ? parseFloat(req.body.maxCurrent) : undefined,
      maxVoltage: req.body.maxVoltage !== undefined ? parseFloat(req.body.maxVoltage) : undefined,
      autoSafety: req.body.autoSafety !== undefined ? !!req.body.autoSafety : true,
      wifiNetwork: req.body.wifiNetwork || undefined,
      signalStrength: req.body.signalStrength !== undefined ? Number(req.body.signalStrength) : undefined,
    };

    // Basic validation (more permissive than Joi middleware but clearer)
    const errors = [];
    if (!payload.name || typeof payload.name !== 'string' || payload.name.length < 3) {
      errors.push('name is required and must be at least 3 characters');
    }
    if (!payload.espId || typeof payload.espId !== 'string') {
      errors.push('espId is required and must be a string');
    }
    if (!payload.room || typeof payload.room !== 'string') {
      errors.push('room is required');
    }
    if (!payload.type || !['outlet', 'switch'].includes(payload.type)) {
      errors.push('type is required and must be "outlet" or "switch"');
    }

    if (errors.length > 0) {
      console.warn('Device create validation failed:', errors, 'payload:', req.body);
      return res.status(400).json({ errors });
    }

    // Build device doc with defaults; userId from auth
    const deviceDoc = new Device({
      name: payload.name,
      type: payload.type,
      room: payload.room,
      socketIndex: payload.socketIndex,
      espId: payload.espId,
      maxCurrent: payload.maxCurrent || 15,
      maxVoltage: payload.maxVoltage || 250,
      autoSafety: payload.autoSafety,
      wifiNetwork: payload.wifiNetwork,
      signalStrength: payload.signalStrength,
      userId: req.user.id,
      // raspberryPiId intentionally left undefined (optional)
    });

    await deviceDoc.save();
    if (req.io) req.io.emit('device-added', deviceDoc);
    res.status(201).json(deviceDoc);
  } catch (error) {
    console.error('Error creating device:', error);
    // If Mongoose validation error, return 400 with details
    if (error && error.name === 'ValidationError') {
      const msgs = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ errors: msgs });
    }
    res.status(500).json({ error: 'Failed to create device' });
  }
});

// NOTE: ESP32 telemetry endpoint moved to routes/esp32.js so it can be public

// PUT update device
router.put('/:id', authenticateToken, validateDevice, async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );
    if (!device) return res.status(404).json({ error: 'Device not found' });
    if (req.io) req.io.emit('device-updated', device);
    res.json(device);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// POST toggle device
router.post('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, userId: req.user.id });
    if (!device) return res.status(404).json({ error: 'Device not found' });
    if (device.status === 'offline') {
      return res.status(400).json({ error: 'Cannot toggle offline device' });
    }

    device.isOn = !device.isOn;
    device.powerConsumption = device.isOn ? Math.random() * 200 + 50 : 0;
    device.currentReading = device.isOn ? Math.random() * 10 + 1 : 0;
    device.lastUpdated = new Date();
    await device.save();

    if (req.io) req.io.emit('device-toggled', device);
    res.json(device);
  } catch (error) {
    console.error('Error toggling device:', error);
    res.status(500).json({ error: 'Failed to toggle device' });
  }
});

// PUT update safety limits
router.put('/:id/safety', authenticateToken, async (req, res) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, userId: req.user.id });

    if (!device) {
      // Try to detect if device exists but belongs to another user for clearer feedback
      const maybeDevice = await Device.findById(req.params.id).lean();
      if (maybeDevice) {
        console.warn(`Toggle denied: device ${req.params.id} belongs to user ${maybeDevice.userId} (requester ${req.user.id})`);
        return res.status(403).json({ error: 'You do not have permission to toggle this device' });
      }
      console.warn(`Toggle failed: device ${req.params.id} not found for user ${req.user.id}`);
      return res.status(404).json({ error: 'Device not found' });
    }

    if (device.status === 'offline') {
      console.warn(`Toggle blocked: device ${device._id} is offline`);
      return res.status(400).json({ error: 'Cannot toggle offline device' });
    }

    device.isOn = !device.isOn;
    device.powerConsumption = device.isOn ? Math.random() * 200 + 50 : 0;
    device.currentReading = device.isOn ? Math.random() * 10 + 1 : 0;
    device.lastUpdated = new Date();
    await device.save();

    if (req.io) req.io.emit('device-toggled', device);
    res.json(device);

    if (req.io) req.io.emit('device-safety-updated', device);
    res.json(device);
  } catch (error) {
    console.error('Error updating safety limits:', error);
    res.status(500).json({ error: 'Failed to update safety limits' });
  }
});

// DELETE device
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const device = await Device.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!device) return res.status(404).json({ error: 'Device not found' });

    if (req.io) req.io.emit('device-deleted', { deviceId: req.params.id });
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

module.exports = router;
