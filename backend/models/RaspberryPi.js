const mongoose = require('mongoose');

const raspberryPiSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  piId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  ipAddress: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(v);
      },
      message: 'Invalid IP address format'
    }
  },
  macAddress: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'error', 'updating'],
    default: 'offline'
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  connectedESPs: [{
    espId: String,
    status: String,
    lastSeen: Date,
    signalStrength: Number
  }],
  systemInfo: {
    cpuUsage: { type: Number, default: 0 },
    memoryUsage: { type: Number, default: 0 },
    temperature: { type: Number, default: 0 },
    uptime: { type: Number, default: 0 },
    diskUsage: { type: Number, default: 0 }
  },
  networkInfo: {
    wifiSSID: String,
    signalStrength: Number,
    bandwidth: Number
  },
  configuration: {
    mqttBroker: String,
    updateInterval: { type: Number, default: 30 },
    maxESPs: { type: Number, default: 20 },
    autoUpdate: { type: Boolean, default: true }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastHeartbeat: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
raspberryPiSchema.index({ userId: 1, status: 1 });
raspberryPiSchema.index({ piId: 1 });
raspberryPiSchema.index({ ipAddress: 1 });

// Virtual for connection status
raspberryPiSchema.virtual('isOnline').get(function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.lastHeartbeat > fiveMinutesAgo;
});

// Pre-save middleware
raspberryPiSchema.pre('save', function(next) {
  if (this.isModified('status') || this.isNew) {
    this.lastHeartbeat = new Date();
  }
  next();
});

module.exports = mongoose.model('RaspberryPi', raspberryPiSchema);