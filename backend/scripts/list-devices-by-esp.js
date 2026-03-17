const mongoose = require('mongoose');
require('dotenv').config();
const Device = require('../models/Device');

async function main() {
  const espId = process.argv[2];
  if (!espId) {
    console.error('Usage: node scripts/list-devices-by-esp.js <espId>');
    process.exit(2);
  }

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sentry', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).catch(err => { console.error('Mongo connect error', err); process.exit(1); });

  const devices = await Device.find({ espId }).sort({ createdAt: 1 }).lean();
  if (!devices || devices.length === 0) {
    console.log(`No devices found for espId=${espId}`);
    process.exit(0);
  }

  console.log(`Found ${devices.length} device(s) for espId=${espId}:`);
  for (const d of devices) {
    console.log(`- id: ${d._id} | name: ${d.name} | socketIndex: ${d.socketIndex} | isOn: ${d.isOn} | userId: ${d.userId} | createdAt: ${d.createdAt}`);
  }

  process.exit(0);
}

main();
