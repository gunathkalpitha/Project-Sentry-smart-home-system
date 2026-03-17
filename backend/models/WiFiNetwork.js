const mongoose = require('mongoose');

const wifiNetworkSchema = new mongoose.Schema({
  ssid: { type: String, required: true, unique: true, trim: true },
  // NOTE: storing WiFi passwords in plaintext is for demo only.
  // In production encrypt this field or use a secure secrets store.
  password: { type: String },
  lastConnectedAt: { type: Date, default: Date.now },
  metadata: { type: Object },
}, { timestamps: true });

wifiNetworkSchema.index({ ssid: 1 });

module.exports = mongoose.model('WiFiNetwork', wifiNetworkSchema);
