const mongoose = require('mongoose');
require('dotenv').config();
const Device = require('../models/Device');

async function main() {
  const deviceId = process.argv[2];
  const state = process.argv[3];
  if (!deviceId || !state) {
    console.error('Usage: node scripts/set-device-state.js <deviceId> <on|off>');
    process.exit(2);
  }
  const isOn = state === 'on';

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sentry', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).catch(err => { console.error('Mongo connect error', err); process.exit(1); });

  const device = await Device.findById(deviceId);
  if (!device) {
    console.error('Device not found:', deviceId);
    process.exit(1);
  }

  device.isOn = isOn;
  device.lastUpdated = new Date();
  await device.save();
  console.log(`Set device ${deviceId} isOn => ${isOn}`);
  process.exit(0);
}

main();
