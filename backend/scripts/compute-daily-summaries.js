const mongoose = require('mongoose');
require('dotenv').config();
const Device = require('../models/Device');
const DeviceReading = require('../models/DeviceReading');
const DailySummary = require('../models/DailySummary');

function parseDate(input) {
  if (!input) return new Date();
  return new Date(input + 'T00:00:00Z');
}

async function computeForDate(dateStr) {
  const dayStart = parseDate(dateStr);
  const dayEnd = new Date(dayStart.getTime() + 24 * 3600 * 1000);
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
    const dateKey = dateStr;
    await DailySummary.findOneAndUpdate({ date: dateKey, deviceId: d._id }, { date: dateKey, deviceId: d._id, userId: d.userId, energyWh, sampleCount }, { upsert: true });
    console.log(`Saved summary for ${d.name} (${d._id}): ${ (energyWh/1000).toFixed(3) } kWh, samples=${sampleCount}`);
  }
}

async function main() {
  const dateArg = process.argv[2];
  const date = dateArg || new Date().toISOString().slice(0,10);
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sentry', { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Computing daily summaries for', date);
  await computeForDate(date);
  process.exit(0);
}

main();
