const mongoose = require('mongoose');
require('dotenv').config();
const Device = require('../models/Device');
const DeviceReading = require('../models/DeviceReading');

function periodToRange(period) {
  const end = new Date();
  let start = new Date(end);
  if (!period || period === 'day') start.setDate(end.getDate() - 1);
  else if (period === 'week') start.setDate(end.getDate() - 7);
  else if (period === 'month') start.setMonth(end.getMonth() - 1);
  else start.setDate(end.getDate() - 1);
  return { start, end };
}

async function main() {
  const userId = process.argv[2];
  const period = process.argv[3] || 'month';
  if (!userId) {
    console.error('Usage: node scripts/compute-user-reports.js <userId> [day|week|month]');
    process.exit(2);
  }

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sentry', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).catch(err => { console.error('Mongo connect error', err); process.exit(1); });

  const { start, end } = periodToRange(period);
  console.log(`Computing energy for user ${userId} from ${start.toISOString()} to ${end.toISOString()}`);

  const devices = await Device.find({ userId }).lean();
  if (!devices || devices.length === 0) {
    console.log('No devices found for user');
    process.exit(0);
  }

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
    console.log(`- ${d.name} (${d._id}): ${ (deviceEnergyWh/1000).toFixed(3) } kWh, samples=${readings.length}`);
  }

  console.log(`Total: ${(totalWh/1000).toFixed(3)} kWh`);
  process.exit(0);
}

main();
