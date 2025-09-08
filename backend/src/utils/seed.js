import mongoose from 'mongoose';
import { MONGODB_URI } from '../config.js';
import User from '../models/User.js';
import Device from '../models/Device.js';
import Reading from '../models/Reading.js';
import bcrypt from 'bcryptjs';

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Seeding...');
  await User.deleteMany({});
  await Device.deleteMany({});
  await Reading.deleteMany({});

  const passwordHash = await bcrypt.hash('password', 10);
  const user = await User.create({ name: 'Admin', email: 'admin@example.com', passwordHash, role: 'admin' });
  const device = await Device.create({ name: 'Sentry-01', location: 'Lab', espId: 'ESP32-001', online: true });
  const now = Date.now();
  const docs = [];
  for (let i = 0; i < 50; i++) {
    const t = new Date(now - (50 - i) * 60000);
    docs.push({
      deviceId: device._id,
      voltage: 220 + Math.random() * 3,
      current: 0.1 + Math.random() * 3,
      power: 20 + Math.random() * 100,
      temperature: 27 + Math.random() * 3,
      humidity: 60 + Math.random() * 10,
      createdAt: t
    });
  }
  await Reading.insertMany(docs);
  console.log('Seeded user and readings. Login with admin@example.com / password');
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
