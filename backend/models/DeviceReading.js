const mongoose = require('mongoose');

const deviceReadingSchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: false },
  espId: { type: String, required: true, trim: true },
  current: { type: Number, required: true, min: 0 },
  voltage: { type: Number, required: true, min: 0 },
  power: { type: Number, required: true, min: 0 },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: false
});

deviceReadingSchema.index({ deviceId: 1 });
deviceReadingSchema.index({ espId: 1 });

module.exports = mongoose.model('DeviceReading', deviceReadingSchema);
