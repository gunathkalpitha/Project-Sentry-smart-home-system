import mongoose from 'mongoose';

const readingSchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  voltage: Number,
  current: Number,
  power: Number,
  temperature: Number,
  humidity: Number,
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

readingSchema.index({ deviceId: 1, createdAt: -1 });

export default mongoose.model('Reading', readingSchema);
