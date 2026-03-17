const express = require('express');
const router = express.Router();
const DeviceReading = require('../models/DeviceReading');
const Device = require('../models/Device');
const DailySummary = require('../models/DailySummary');

function periodToRange(period) {
  const end = new Date();
  let start = new Date(end);
  if (!period || period === 'day') start.setDate(end.getDate() - 1);
  else if (period === 'week') start.setDate(end.getDate() - 7);
  else if (period === 'month') start.setMonth(end.getMonth() - 1);
  else start.setDate(end.getDate() - 1);
  return { start, end };
}

// GET /api/reports/energy?period=day|week|month
// Returns total consumption and per-device breakdown for the authenticated user
router.get('/energy', async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const { start, end } = periodToRange(period);
    // For day period, prefer precomputed daily summaries for performance
    const userId = req.user && req.user.id;
    const devices = await Device.find({ userId }).lean();
    if (!devices || devices.length === 0) return res.json({ success: true, totalKWh: 0, devices: [] });

    if (period === 'day') {
      const dateKey = new Date(start).toISOString().slice(0,10);
      // Load daily summaries and join with devices
      const sums = await DailySummary.find({ date: dateKey, userId }).lean();
      const byDevice = {};
      sums.forEach(s => { byDevice[s.deviceId.toString()] = s; });
      let totalWh = 0;
      const results = devices.map(d => {
        const s = byDevice[d._id.toString()];
        const energyWh = s ? s.energyWh : 0;
        totalWh += energyWh;
        return { deviceId: d._id, name: d.name, espId: d.espId, socketIndex: d.socketIndex, energyWh, energyKWh: energyWh/1000.0, sampleCount: s ? s.sampleCount : 0 };
      });
      return res.json({ success: true, period: { start, end }, totalKWh: totalWh/1000.0, devices: results });
    }

    // Fallback: compute on-the-fly for other periods (week/month)
    const results = [];
    let totalWh = 0;
    for (const d of devices) {
      const readings = await DeviceReading.find({ deviceId: d._id, timestamp: { $gte: start, $lte: end } }).sort({ timestamp: 1 }).lean();
      let deviceEnergyWh = 0;
      for (let i = 0; i < readings.length; i++) {
        const t0 = new Date(readings[i].timestamp);
        const t1 = (i + 1 < readings.length) ? new Date(readings[i + 1].timestamp) : end;
        const deltaHours = Math.max(0, (t1 - t0) / 3600000.0);
        const p0 = readings[i].power || 0;
        const p1 = (i + 1 < readings.length) ? (readings[i + 1].power || 0) : p0;
        const avgP = (p0 + p1) / 2.0;
        deviceEnergyWh += avgP * deltaHours;
      }
      totalWh += deviceEnergyWh;
      results.push({ deviceId: d._id, name: d.name, espId: d.espId, socketIndex: d.socketIndex, energyWh: deviceEnergyWh, energyKWh: deviceEnergyWh/1000.0 });
    }
    return res.json({ success: true, period: { start, end }, totalKWh: totalWh/1000.0, devices: results });
  } catch (err) {
    console.error('Error generating energy report:', err);
    res.status(500).json({ error: 'Failed to generate energy report' });
  }
});

// Admin endpoint: POST /api/reports/recompute-day { date: 'YYYY-MM-DD' }
// Recomputes daily summaries for the given date. Protected.
router.post('/recompute-day', async (req, res) => {
  try {
    const date = req.body.date || new Date().toISOString().slice(0,10);
    // Run compute script logic inline for simplicity
    const dayStart = new Date(date + 'T00:00:00Z');
    const dayEnd = new Date(dayStart.getTime() + 24*3600*1000);
    const devices = await Device.find({}).lean();
    for (const d of devices) {
      const readings = await DeviceReading.find({ deviceId: d._id, timestamp: { $gte: dayStart, $lt: dayEnd } }).sort({ timestamp: 1 }).lean();
      let energyWh = 0;
      for (let i = 0; i < readings.length; i++) {
        const t0 = new Date(readings[i].timestamp);
        const t1 = (i + 1 < readings.length) ? new Date(readings[i + 1].timestamp) : dayEnd;
        const deltaHours = Math.max(0, (t1 - t0) / 3600000.0);
        const p0 = readings[i].power || 0;
        const p1 = (i + 1 < readings.length) ? (readings[i + 1].power || 0) : p0;
        const avgP = (p0 + p1) / 2.0;
        energyWh += avgP * deltaHours;
      }
      const sampleCount = readings.length;
      await DailySummary.findOneAndUpdate({ date, deviceId: d._id }, { date, deviceId: d._id, userId: d.userId, energyWh, sampleCount }, { upsert: true });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Error recomputing daily summaries:', err);
    res.status(500).json({ error: 'Failed to recompute daily summaries' });
  }
});

// GET /api/reports/download?period=day|week|month&format=csv|pdf|excel
router.get('/download', async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const format = (req.query.format || 'csv').toLowerCase();
    // Reuse energy aggregation logic
    const reportReq = { query: { period }, user: req.user };
    // call internal function path: generate same data as /energy
    const { start, end } = periodToRange(period);
    const userId = req.user && req.user.id;
    const devices = await Device.find({ userId }).lean();
    const rows = [];
    if (period === 'day') {
      const dateKey = new Date(start).toISOString().slice(0,10);
      const sums = await DailySummary.find({ date: dateKey, userId }).lean();
      const byDevice = {};
      sums.forEach(s => { byDevice[s.deviceId.toString()] = s; });
      for (const d of devices) {
        const s = byDevice[d._id.toString()];
        const energyKWh = (s ? s.energyWh : 0) / 1000.0;
        rows.push({ device: d.name, espId: d.espId, socketIndex: d.socketIndex, energyKWh, samples: s ? s.sampleCount : 0 });
      }
    } else {
      for (const d of devices) {
        const readings = await DeviceReading.find({ deviceId: d._id, timestamp: { $gte: start, $lte: end } }).sort({ timestamp: 1 }).lean();
        let deviceEnergyWh = 0;
        for (let i = 0; i < readings.length; i++) {
          const t0 = new Date(readings[i].timestamp);
          const t1 = (i + 1 < readings.length) ? new Date(readings[i + 1].timestamp) : end;
          const deltaHours = Math.max(0, (t1 - t0) / 3600000.0);
          const p0 = readings[i].power || 0;
          const p1 = (i + 1 < readings.length) ? (readings[i + 1].power || 0) : p0;
          const avgP = (p0 + p1) / 2.0;
          deviceEnergyWh += avgP * deltaHours;
        }
        rows.push({ device: d.name, espId: d.espId, socketIndex: d.socketIndex, energyKWh: deviceEnergyWh/1000.0, samples: readings.length });
      }
    }

    if (format === 'csv') {
      res.setHeader('Content-Disposition', `attachment; filename="sentry-report-${period}.csv"`);
      res.setHeader('Content-Type', 'text/csv');
      // Write CSV header
      res.write('device,espId,socketIndex,energy_kWh,samples\n');
      for (const r of rows) {
        res.write(`${r.device},${r.espId},${r.socketIndex},${r.energyKWh},${r.samples}\n`);
      }
      res.end();
      return;
    }

    // For PDF/Excel, stub a JSON response for now (frontend can handle)
    return res.json({ success: true, format, rows });
  } catch (err) {
    console.error('Error generating report download:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
