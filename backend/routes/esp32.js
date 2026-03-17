const express = require('express');
const router = express.Router();

// Keep a short-lived in-memory map of last relays returned per espId to avoid
// noisy duplicate logs when devices poll frequently. This is intentionally
// ephemeral (lost on restart) and only affects logging, not behavior.
const lastRelaysByEsp = new Map();
const Device = require('../models/Device');
const DeviceReading = require('../models/DeviceReading');

// Public endpoint: POST /api/devices/data
// This endpoint is intentionally public so ESP devices can POST telemetry
// without requiring a user JWT. It will either update an existing Device
// (matched by espId) or emit an `esp32-discovered` event so the frontend
// can show the unregistered device for claiming.
router.post('/devices/data', async (req, res) => {
  const { espId, current, voltage } = req.body;
  if (!espId || typeof current !== 'number' || typeof voltage !== 'number') {
    return res.status(400).json({ error: 'espId, current, and voltage are required and must be correct types' });
  }

  try {
    // If the ESP supplied an explicit socketIndex, update only that logical device.
    // Some firmware sends an `activeSockets` bitmask instead (bit1=socket1, bit2=socket2).
    // Prefer explicit socketIndex, then activeSockets, otherwise fall back to legacy (update all devices).
    const socketIndex = req.body.socketIndex !== undefined ? Number(req.body.socketIndex) : null;
    const activeSockets = req.body.activeSockets !== undefined ? Number(req.body.activeSockets) : null;

    if (socketIndex) {
      const device = await Device.findOne({ espId, socketIndex });
      if (device) {
        device.currentReading = current;
        device.voltageReading = voltage;
        device.powerConsumption = current * voltage;
        if (device.powerConsumption > 0) {
          device.lastNonZeroCurrent = current;
          device.lastNonZeroVoltage = voltage;
          device.lastNonZeroPower = device.powerConsumption;
        }
        device.status = 'online';
        if (req.body.ssid) device.wifiNetwork = req.body.ssid;
        device.lastUpdated = new Date();
        await device.save();

        const reading = new DeviceReading({
          deviceId: device._id,
          espId,
          current,
          voltage,
          power: device.powerConsumption,
          timestamp: new Date()
        });
        await reading.save();

        if (req.io) {
          req.io.to(`user_${device.userId}`).emit('sensor-reading', {
            deviceId: device._id,
            current,
            voltage,
            power: device.powerConsumption,
            timestamp: reading.timestamp,
            readingId: reading._id
          });

          // Emit discovery for this esp with socket info
          req.io.emit('esp32-discovered', {
            espId,
            registered: true,
            sockets: [{ socketIndex: device.socketIndex, deviceId: device._id, isOn: !!device.isOn, name: device.name }],
            wifiNetwork: device.wifiNetwork || null,
            timestamp: new Date()
          });
        }

        console.log(`[ESP32 DATA] Updated device (socket ${socketIndex}) for espId=${espId} current=${current} voltage=${voltage}`);
        return res.json({ success: true, updated: true, socketIndex: socketIndex, deviceId: device._id });
      }
      // If socketIndex provided but no device registered yet, fall through and just store reading
    } else if (activeSockets !== null) {
      // activeSockets is a bitmask: bit1 -> socketIndex 1, bit2 -> socketIndex 2
      const indexes = [];
      if (activeSockets & 1) indexes.push(1);
      if (activeSockets & 2) indexes.push(2);
      if (indexes.length > 0) {
        const devicesToUpdate = await Device.find({ espId, socketIndex: { $in: indexes } });
        if (devicesToUpdate && devicesToUpdate.length > 0) {
          const readings = [];
          for (const device of devicesToUpdate) {
            device.currentReading = current;
            device.voltageReading = voltage;
            device.powerConsumption = current * voltage;
            if (device.powerConsumption > 0) {
              device.lastNonZeroCurrent = current;
              device.lastNonZeroVoltage = voltage;
              device.lastNonZeroPower = device.powerConsumption;
            }
            device.status = 'online';
            if (req.body.ssid) device.wifiNetwork = req.body.ssid;
            device.lastUpdated = new Date();
            await device.save();

            const reading = new DeviceReading({
              deviceId: device._id,
              espId,
              current,
              voltage,
              power: device.powerConsumption,
              timestamp: new Date()
            });
            await reading.save();
            readings.push({ device, reading });
          }

          if (req.io) {
            for (const { device, reading } of readings) {
              req.io.to(`user_${device.userId}`).emit('sensor-reading', {
                deviceId: device._id,
                current,
                voltage,
                power: device.powerConsumption,
                timestamp: reading.timestamp,
                readingId: reading._id
              });
            }

            const sockets = devicesToUpdate.map(d => ({ socketIndex: d.socketIndex, deviceId: d._id, isOn: !!d.isOn, name: d.name }));
            req.io.emit('esp32-discovered', { espId, registered: true, sockets, wifiNetwork: devicesToUpdate[0].wifiNetwork || null, timestamp: new Date() });
          }

          console.log(`[ESP32 DATA] Updated ${devicesToUpdate.length} device(s) for espId=${espId} via activeSockets=${activeSockets} current=${current} voltage=${voltage}`);
          return res.json({ success: true, updated: true, sockets: devicesToUpdate.map(d => ({ socketIndex: d.socketIndex, deviceId: d._id })) });
        }
        // If no matching devices for active sockets, fall through to legacy behavior below
      }
    }

    // Legacy/multi-device flow: update all devices for this espId
    const devices = await Device.find({ espId });
    if (devices && devices.length > 0) {
      // Update each logical device with the same telemetry (device-level sensors are shared)
      const readings = [];
      for (const device of devices) {
        device.currentReading = current;
        device.voltageReading = voltage;
        device.powerConsumption = current * voltage;
        if (device.powerConsumption > 0) {
          device.lastNonZeroCurrent = current;
          device.lastNonZeroVoltage = voltage;
          device.lastNonZeroPower = device.powerConsumption;
        }
        device.status = 'online';
        if (req.body.ssid) device.wifiNetwork = req.body.ssid;
        device.lastUpdated = new Date();
        await device.save();

        // Persist a reading per device
        const reading = new DeviceReading({
          deviceId: device._id,
          espId,
          current,
          voltage,
          power: device.powerConsumption,
          timestamp: new Date()
        });
        await reading.save();
        readings.push({ device, reading });
      }

      if (req.io) {
        // Emit sensor-reading for each device to its owner's room
        for (const { device, reading } of readings) {
          const payload = {
            deviceId: device._id,
            current,
            voltage,
            power: device.powerConsumption,
            timestamp: reading.timestamp,
            readingId: reading._id
          };
          req.io.to(`user_${device.userId}`).emit('sensor-reading', payload);
        }

        // Broadcast discovery with socket details so AddDeviceModal/WiFi can show both sockets
        const sockets = devices.map(d => ({ socketIndex: d.socketIndex, deviceId: d._id, isOn: !!d.isOn, name: d.name }));
        const discoveryPayload = {
          espId,
          registered: true,
          sockets,
          wifiNetwork: devices[0].wifiNetwork || null,
          timestamp: new Date()
        };
        req.io.emit('esp32-discovered', discoveryPayload);
        // Also emit to each owning user's room
        const byUser = {};
        devices.forEach(d => {
          const uid = d.userId && d.userId.toString();
          if (!uid) return;
          if (!byUser[uid]) byUser[uid] = [];
          byUser[uid].push(d.espId);
        });
        for (const uid of Object.keys(byUser)) {
          req.io.to(`user_${uid}`).emit('esp32-discovered', discoveryPayload);
        }

        // Also emit wifi-connected list per SSID for each owner (if available)
        if (devices[0].wifiNetwork) {
          const connected = await Device.find({ wifiNetwork: devices[0].wifiNetwork, status: 'online' }).select('espId');
          const espIds = connected.map(d => d.espId);
          // Emit to each owner of devices on this esp
          for (const d of devices) {
            if (d.userId) req.io.to(`user_${d.userId}`).emit('wifi-connected', espIds);
          }
        }
      }

      console.log(`[ESP32 DATA] Updated ${devices.length} device(s) for espId=${espId} current=${current} voltage=${voltage}`);
      // Return a summary so the ESP can know it's registered and which sockets mapping exists
      return res.json({ success: true, updated: true, sockets: devices.map(d => ({ socketIndex: d.socketIndex, deviceId: d._id })) });
    }

    // No registered devices for this ESP yet
    console.log(`[ESP32 DATA] Discovered unregistered espId=${espId} current=${current} voltage=${voltage}`);
    // Save the reading even if the device hasn't been registered yet so we have data
    const reading = new DeviceReading({
      deviceId: null,
      espId,
      current,
      voltage,
      power: current * voltage,
      timestamp: new Date()
    });
    await reading.save();

    if (req.io) {
      req.io.emit('esp32-discovered', { espId, current, voltage, timestamp: reading.timestamp });
    }

    return res.json({ success: true, discovered: true });
  } catch (error) {
    console.error('ESP32 data handler error:', error);
    return res.status(500).json({ error: 'Failed to process ESP32 data' });
  }
});

module.exports = router;

// Public endpoint for ESP to fetch relay/control state for its espId
// GET /api/devices/:espId/relay
router.get('/devices/:espId/relay', async (req, res) => {
  try {
    const { espId } = req.params;
    if (!espId) return res.status(400).json({ error: 'espId required' });

    const devices = await Device.find({ espId });
    if (!devices || devices.length === 0) {
      // Not registered yet - return defaults (all off)
      console.log(`[ESP RELAY] espId=${espId} polled: no devices registered, returning all off`);
      return res.json({ success: true, relays: { mainSocket: false, backupSocket: false } });
    }

    // Map sockets by socketIndex
    const main = devices.find(d => d.socketIndex === 1);
    const backup = devices.find(d => d.socketIndex === 2);

    const relaysObj = { mainSocket: !!(main && main.isOn), backupSocket: !!(backup && backup.isOn) };
    const resp = { success: true, relays: relaysObj };
    const last = lastRelaysByEsp.get(espId);
    // Compare shallow equality
    const changed = !last || last.mainSocket !== relaysObj.mainSocket || last.backupSocket !== relaysObj.backupSocket;
    if (changed) {
      console.log(`[ESP RELAY] espId=${espId} polled: returning`, relaysObj);
      lastRelaysByEsp.set(espId, relaysObj);
    }
    return res.json(resp);
  } catch (err) {
    console.error('Error fetching relay state for esp:', err);
    res.status(500).json({ error: 'Failed to fetch relay state' });
  }
});

module.exports = router;
