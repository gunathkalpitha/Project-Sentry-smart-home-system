import mongoose from 'mongoose';

const relaySchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  channel: { type: Number, required: true }, // 1 or 2
  state: { type: Boolean, default: false }
}, { timestamps: true });

relaySchema.index({ deviceId: 1, channel: 1 }, { unique: true });

export default mongoose.model('Relay', relaySchema);
