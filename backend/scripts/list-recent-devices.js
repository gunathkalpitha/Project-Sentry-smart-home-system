const mongoose = require('mongoose');
require('dotenv').config();
const Device = require('../models/Device');

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sentry', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).catch(err => { console.error('Mongo connect error', err); process.exit(1); });

  const devices = await Device.find({}).sort({ createdAt: -1 }).limit(20).lean();
  if (!devices || devices.length === 0) {
    console.log('No devices found in DB');
    process.exit(0);
  }

  console.log('Recent devices:');
  for (const d of devices) {
    console.log(`- id: ${d._id} | name: ${d.name} | espId: ${d.espId} | socketIndex: ${d.socketIndex} | isOn: ${d.isOn} | userId: ${d.userId} | createdAt: ${d.createdAt}`);
  }

  process.exit(0);
}

main();
