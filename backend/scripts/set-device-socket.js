const mongoose = require('mongoose');
require('dotenv').config();
const Device = require('../models/Device');

async function main() {
  const deviceId = process.argv[2];
  const socketIndex = Number(process.argv[3]);
  if (!deviceId || !socketIndex) {
    console.error('Usage: node scripts/set-device-socket.js <deviceId> <socketIndex>');
    process.exit(2);
  }

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sentry', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).catch(err => { console.error('Mongo connect error', err); process.exit(1); });

  const device = await Device.findById(deviceId);
  if (!device) {
    console.error('Device not found:', deviceId);
    process.exit(1);
  }

  device.socketIndex = socketIndex;
  await device.save();
  console.log(`Updated device ${deviceId} socketIndex => ${socketIndex}`);
  process.exit(0);
}

main();
