const express = require('express');
const router = express.Router();
const DeviceReading = require('../models/DeviceReading');
const Device = require('../models/Device');

// Helper to parse period into start/end Date
function periodToRange(period) {
  const end = new Date();
  let start = new Date(end);
  if (!period || period === 'day') start.setDate(end.getDate() - 1);
  else if (period === 'week') start.setDate(end.getDate() - 7);
  else if (period === 'month') start.setMonth(end.getMonth() - 1);
  else {
    // fallback to 1 day
    start.setDate(end.getDate() - 1);
  }
  return { start, end };
}

// GET /api/sensors/readings/:deviceId?period=day|week|month - returns raw readings
router.get('/readings/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const period = req.query.period;
    const { start, end } = periodToRange(period);
    const readings = await DeviceReading.find({ deviceId, timestamp: { $gte: start, $lte: end } }).sort({ timestamp: 1 }).lean();
    res.json({ success: true, readings });
  } catch (err) {
    console.error('Error fetching readings:', err);
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
});

// GET /api/sensors/summary/:deviceId?period=day|week|month - returns aggregated metrics including energy (Wh)
router.get('/summary/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const period = req.query.period;
    const { start, end } = periodToRange(period);

    // Fetch readings in the period
    const readings = await DeviceReading.find({ deviceId, timestamp: { $gte: start, $lte: end } }).sort({ timestamp: 1 }).lean();

    let totalEnergyWh = 0; // watt-hours
    let totalPowerSum = 0; // sum of power samples (W)
    let count = 0;
    let minPower = null;
    let maxPower = null;

    if (readings && readings.length > 0) {
      count = readings.length;
      for (let i = 0; i < readings.length; i++) {
        const r = readings[i];
        totalPowerSum += (r.power || 0);
        if (minPower === null || r.power < minPower) minPower = r.power;
        if (maxPower === null || r.power > maxPower) maxPower = r.power;
        // Integrate between this reading and the next (or period end for last)
        const t0 = new Date(r.timestamp);
        const t1 = (i + 1 < readings.length) ? new Date(readings[i + 1].timestamp) : new Date(end);
        const deltaHours = Math.max(0, (t1 - t0) / 3600000.0);
        // Use average power between samples if next exists, otherwise use this sample
        const p0 = r.power || 0;
        const p1 = (i + 1 < readings.length) ? (readings[i + 1].power || 0) : p0;
        const avgP = (p0 + p1) / 2.0;
        totalEnergyWh += avgP * deltaHours;
      }
    }

    const avgPower = count > 0 ? totalPowerSum / count : 0;

    // Also include device static fields for convenience
    const device = await Device.findById(deviceId).select('name espId socketIndex');

    res.json({
      success: true,
      device: device || null,
      period: { start, end },
      metrics: {
        totalEnergyWh,
        totalEnergyKWh: totalEnergyWh / 1000.0,
        avgPowerW: avgPower,
        minPowerW: minPower || 0,
        maxPowerW: maxPower || 0,
        sampleCount: count
      }
    });
  } catch (err) {
    console.error('Error computing summary:', err);
    res.status(500).json({ error: 'Failed to compute summary' });
  }
});

module.exports = router;

// GET /api/sensors/recent-summary/:deviceId?seconds=5 - returns avg power and energy over last N seconds
router.get('/recent-summary/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const seconds = Number(req.query.seconds || 5);
    const end = new Date();
    const start = new Date(end.getTime() - Math.max(1, seconds) * 1000);

    const readings = await DeviceReading.find({ deviceId, timestamp: { $gte: start, $lte: end } }).sort({ timestamp: 1 }).lean();

    let avgPower = 0;
    let totalEnergyWh = 0;
    if (readings && readings.length > 0) {
      const sumPower = readings.reduce((s, r) => s + (r.power || 0), 0);
      avgPower = sumPower / readings.length;
      // Integrate power over the interval (trapezoid rule)
      for (let i = 0; i < readings.length; i++) {
        const t0 = new Date(readings[i].timestamp);
        const t1 = (i + 1 < readings.length) ? new Date(readings[i + 1].timestamp) : end;
        const deltaHours = Math.max(0, (t1 - t0) / 3600000.0);
        const p0 = readings[i].power || 0;
        const p1 = (i + 1 < readings.length) ? (readings[i + 1].power || 0) : p0;
        const avgP = (p0 + p1) / 2.0;
        totalEnergyWh += avgP * deltaHours;
      }
    }

    return res.json({ success: true, metrics: { avgPowerW: avgPower, totalEnergyWh } });
  } catch (err) {
    console.error('Error computing recent summary:', err);
    res.status(500).json({ error: 'Failed to compute recent summary' });
  }
});
