import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  espId: String,
  online: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Device', deviceSchema);
