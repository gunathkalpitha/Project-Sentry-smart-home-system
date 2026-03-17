const express = require('express');
const router = express.Router();
const RaspberryPi = require('../models/RaspberryPi');
const Device = require('../models/Device');
const { validateRaspberryPi } = require('../middleware/validation');

// GET /api/raspberrypi - Get all user's Raspberry Pi units
router.get('/', async (req, res) => {
  try {
    const raspberryPis = await RaspberryPi.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    // Add connected device count for each Pi
    for (let pi of raspberryPis) {
      const deviceCount = await Device.countDocuments({ 
        raspberryPiId: pi._id,
        userId: req.user.id 
      });
      pi.connectedDeviceCount = deviceCount;
    }
    
    res.json(raspberryPis);
  } catch (error) {
    console.error('Error fetching Raspberry Pi units:', error);
    res.status(500).json({ error: 'Failed to fetch Raspberry Pi units' });
  }
});

// GET /api/raspberrypi/:id - Get specific Raspberry Pi
router.get('/:id', async (req, res) => {
  try {
    const raspberryPi = await RaspberryPi.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!raspberryPi) {
      return res.status(404).json({ error: 'Raspberry Pi not found' });
    }
    
    // Get connected devices
    const connectedDevices = await Device.find({ 
      raspberryPiId: raspberryPi._id,
      userId: req.user.id 
    });
    
    res.json({
      ...raspberryPi.toObject(),
      connectedDevices
    });
  } catch (error) {
    console.error('Error fetching Raspberry Pi:', error);
    res.status(500).json({ error: 'Failed to fetch Raspberry Pi' });
  }
});

// POST /api/raspberrypi - Register new Raspberry Pi
router.post('/', validateRaspberryPi, async (req, res) => {
  try {
    const piData = {
      ...req.body,
      userId: req.user.id,
      status: 'online',
      lastHeartbeat: new Date()
    };
    
    const raspberryPi = new RaspberryPi(piData);
    await raspberryPi.save();
    
    // Emit to connected clients
    req.io.emit('raspberrypi-added', raspberryPi);
    
    res.status(201).json(raspberryPi);
  } catch (error) {
    console.error('Error registering Raspberry Pi:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Raspberry Pi ID or MAC address already exists' });
    }
    
    res.status(500).json({ error: 'Failed to register Raspberry Pi' });
  }
});

// PUT /api/raspberrypi/:id - Update Raspberry Pi
router.put('/:id', async (req, res) => {
  try {
    const raspberryPi = await RaspberryPi.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body, lastHeartbeat: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!raspberryPi) {
      return res.status(404).json({ error: 'Raspberry Pi not found' });
    }
    
    // Emit to connected clients
    req.io.emit('raspberrypi-updated', raspberryPi);
    
    res.json(raspberryPi);
  } catch (error) {
    console.error('Error updating Raspberry Pi:', error);
    res.status(500).json({ error: 'Failed to update Raspberry Pi' });
  }
});

// POST /api/raspberrypi/:id/heartbeat - Raspberry Pi heartbeat
router.post('/:id/heartbeat', async (req, res) => {
  try {
    const { systemInfo, connectedESPs, networkInfo } = req.body;
    
    const raspberryPi = await RaspberryPi.findOneAndUpdate(
      { piId: req.params.id },
      { 
        status: 'online',
        lastHeartbeat: new Date(),
        systemInfo: systemInfo || {},
        connectedESPs: connectedESPs || [],
        networkInfo: networkInfo || {}
      },
      { new: true }
    );
    
    if (!raspberryPi) {
      return res.status(404).json({ error: 'Raspberry Pi not found' });
    }
    
    // Update device statuses based on connected ESPs
    if (connectedESPs && connectedESPs.length > 0) {
      for (const esp of connectedESPs) {
        await Device.updateMany(
          { espId: esp.espId, raspberryPiId: raspberryPi._id },
          { 
            status: esp.status,
            signalStrength: esp.signalStrength,
            lastUpdated: new Date()
          }
        );
      }
    }
    
    // Emit real-time update
    req.io.emit('raspberrypi-heartbeat', {
      piId: raspberryPi.piId,
      status: raspberryPi.status,
      systemInfo: raspberryPi.systemInfo,
      connectedESPs: raspberryPi.connectedESPs
    });
    
    res.json({ status: 'success', timestamp: new Date() });
  } catch (error) {
    console.error('Error processing heartbeat:', error);
    res.status(500).json({ error: 'Failed to process heartbeat' });
  }
});

// POST /api/raspberrypi/:id/scan-esp - Scan for ESP32 devices
router.post('/:id/scan-esp', async (req, res) => {
  try {
    const raspberryPi = await RaspberryPi.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!raspberryPi) {
      return res.status(404).json({ error: 'Raspberry Pi not found' });
    }
    
    // Emit scan command to Raspberry Pi
    req.io.emit('scan-esp-devices', { piId: raspberryPi.piId });
    
    // Mock response for demo (in real implementation, this would be async)
    setTimeout(() => {
      const mockESPs = [
        { espId: 'ESP32_001', status: 'available', signalStrength: 85 },
        { espId: 'ESP32_002', status: 'available', signalStrength: 72 },
        { espId: 'ESP32_003', status: 'available', signalStrength: 68 }
      ];
      
      req.io.emit('esp-scan-results', {
        piId: raspberryPi.piId,
        devices: mockESPs
      });
    }, 2000);
    
    res.json({ message: 'ESP32 scan initiated', piId: raspberryPi.piId });
  } catch (error) {
    console.error('Error initiating ESP scan:', error);
    res.status(500).json({ error: 'Failed to initiate ESP scan' });
  }
});

// DELETE /api/raspberrypi/:id - Remove Raspberry Pi
router.delete('/:id', async (req, res) => {
  try {
    const raspberryPi = await RaspberryPi.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!raspberryPi) {
      return res.status(404).json({ error: 'Raspberry Pi not found' });
    }
    
    // Remove all associated devices
    await Device.deleteMany({ raspberryPiId: raspberryPi._id });
    
    // Emit to connected clients
    req.io.emit('raspberrypi-deleted', { piId: raspberryPi.piId });
    
    res.json({ message: 'Raspberry Pi and associated devices removed successfully' });
  } catch (error) {
    console.error('Error removing Raspberry Pi:', error);
    res.status(500).json({ error: 'Failed to remove Raspberry Pi' });
  }
});

module.exports = router;