const mongoose = require('mongoose');

const dailySummarySchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  energyWh: { type: Number, default: 0 },
  sampleCount: { type: Number, default: 0 }
}, { timestamps: true });

dailySummarySchema.index({ date: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model('DailySummary', dailySummarySchema);
