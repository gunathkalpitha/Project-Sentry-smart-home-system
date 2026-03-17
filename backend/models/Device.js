const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['outlet', 'switch'],
    default: 'outlet'
  },
  room: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'error'],
    default: 'offline'
  },
  isOn: {
    type: Boolean,
    default: false
  },
  currentReading: {
    type: Number,
    default: 0,
    min: 0
  },
  voltageReading: {
    type: Number,
    default: 0,
    min: 0
  },
  powerConsumption: {
    type: Number,
    default: 0,
    min: 0
  },
  // Preserve the last non-zero measurements so the UI can show the last
  // valid values after a device is turned off (avoids showing all zeros).
  lastNonZeroCurrent: {
    type: Number,
    default: 0,
    min: 0
  },
  lastNonZeroVoltage: {
    type: Number,
    default: 0,
    min: 0
  },
  lastNonZeroPower: {
    type: Number,
    default: 0,
    min: 0
  },
  maxCurrent: {
    type: Number,
    required: true,
    default: 15,
    min: 0.1,
    max: 50
  },
  maxVoltage: {
    type: Number,
    required: true,
    default: 250,
    min: 100,
    max: 300
  },
  autoSafety: {
    type: Boolean,
    default: true
  },
  espId: {
    type: String,
    required: true,
    trim: true
  },
  raspberryPiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RaspberryPi',
    required: false
  },
  wifiNetwork: {
    type: String,
    trim: true
  },
  signalStrength: {
    type: Number,
    min: 0,
    max: 100
  },
  // If an ESP hosts multiple relays/outlets, use socketIndex to map which
  // logical device this document represents (1 = mainSocket, 2 = backupSocket)
  socketIndex: {
    type: Number,
    enum: [1, 2],
    default: 1
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
deviceSchema.index({ userId: 1, status: 1 });
deviceSchema.index({ espId: 1 });
deviceSchema.index({ room: 1 });

// Virtual for safety status
deviceSchema.virtual('isSafetyViolation').get(function() {
  return this.currentReading > this.maxCurrent || this.voltageReading > this.maxVoltage;
});

// Pre-save middleware to update lastUpdated
deviceSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Device', deviceSchema);