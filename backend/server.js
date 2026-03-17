const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/database');
const deviceRoutes = require('./routes/devices');
const esp32Routes = require('./routes/esp32');
const authRoutes = require('./routes/auth');
const raspberryPiRoutes = require('./routes/raspberrypi');
const wifiRoutes = require('./routes/wifi');   // ✅ WiFi routes (public)
const securityRoutes = require('./routes/security');
const environmentalRoutes = require('./routes/environmental');
const reportsRoutes = require('./routes/reports');
const sensorsRoutes = require('./routes/sensors');
const { authenticateToken } = require('./middleware/auth');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Rate limiting (we'll register the limiter after public routes so ESPs and
// unauthenticated endpoints are not accidentally rate-limited)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =================== ROUTES ===================

// ✅ Auth routes (public)
app.use('/api/auth', authRoutes);

// ✅ WiFi routes (public, no auth required)
app.use('/api/wifi', wifiRoutes);

// Public ESP32/telemetry endpoint (so devices can POST without JWT)
app.use('/api', esp32Routes);

// ✅ Protected routes
app.use('/api/devices', authenticateToken, deviceRoutes);
app.use('/api/raspberrypi', authenticateToken, raspberryPiRoutes);
app.use('/api/security', authenticateToken, securityRoutes);
app.use('/api/environmental', authenticateToken, environmentalRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);
// Sensors summary endpoints (protected)
app.use('/api/sensors', authenticateToken, sensorsRoutes);

// ==============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Sentry Backend API'
  });
});

// Socket.IO connection handling
socketHandler(io);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🛡️  Sentry Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for real-time connections`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});

module.exports = { app, server, io };
