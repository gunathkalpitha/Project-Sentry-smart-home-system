# Sentry Backend API

Backend server for the Sentry Smart Home Security System built with Node.js, Express, Socket.IO, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone and setup**
```bash
cd backend
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

4. **Run the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Devices
- `GET /api/devices` - Get all user devices
- `POST /api/devices` - Create new device
- `GET /api/devices/:id` - Get specific device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `POST /api/devices/:id/toggle` - Toggle device on/off
- `PUT /api/devices/:id/safety` - Update safety limits

### WiFi Management
- `GET /api/wifi/scan` - Scan for WiFi networks
- `POST /api/wifi/connect` - Connect to WiFi network
- `GET /api/wifi/status` - Get current WiFi status

### Security
- `GET /api/security/sensors` - Get security sensors
- `GET /api/security/alerts` - Get security alerts
- `POST /api/security/arm` - Arm security system
- `POST /api/security/disarm` - Disarm security system

### Environmental
- `GET /api/environmental/readings` - Get environmental data
- `GET /api/environmental/latest` - Get latest readings

### Reports
- `GET /api/reports/energy` - Get energy reports
- `GET /api/reports/security` - Get security reports
- `GET /api/reports/download` - Download reports

## 🔌 Socket.IO Events

### Client to Server
- `device-command` - Send command to device
- `esp32-data` - Receive data from ESP32

### Server to Client
- `device-update` - Device status updated
- `sensor-reading` - Real-time sensor data
- `safety-alert` - Safety limit exceeded
- `device-added` - New device added
- `device-deleted` - Device removed

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  avatar: String,
  role: ['admin', 'user', 'guest'],
  googleId: String,
  preferences: {
    theme: ['light', 'dark', 'auto'],
    notifications: { email, sms, push },
    alertSettings: { securityAlerts, maintenanceReminders, energyReports }
  },
  emergencyContacts: [{ name, phone, relationship }]
}
```

### Device Model
```javascript
{
  name: String,
  type: ['outlet', 'switch'],
  room: String,
  status: ['online', 'offline', 'error'],
  isOn: Boolean,
  currentReading: Number,
  voltageReading: Number,
  powerConsumption: Number,
  maxCurrent: Number,
  maxVoltage: Number,
  autoSafety: Boolean,
  espId: String (unique),
  wifiNetwork: String,
  signalStrength: Number,
  userId: ObjectId (ref: User)
}
```

## 🔐 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with Joi
- User authorization checks

## 🛠️ Development

### Project Structure
```
backend/
├── config/          # Database and app configuration
├── models/          # MongoDB models
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── socket/          # Socket.IO handlers
├── utils/           # Utility functions
├── tests/           # Test files
└── server.js        # Main server file
```

### Testing
```bash
npm test
```

### Environment Variables
See `.env.example` for all required environment variables.

## 🔧 ESP32 Integration

The backend is designed to work with ESP32 devices:

1. **MQTT Communication**: ESP32 devices publish sensor data via MQTT
2. **Real-time Updates**: Socket.IO broadcasts device status changes
3. **Safety Monitoring**: Automatic alerts when limits are exceeded
4. **Device Management**: Remote control and configuration

### ESP32 Data Format
```json
{
  "espId": "ESP32_001",
  "current": 2.5,
  "voltage": 240.2,
  "power": 600.5,
  "temperature": 25.3,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 📊 Monitoring & Logging

- Morgan HTTP request logging
- Error handling middleware
- Health check endpoint: `GET /api/health`
- Real-time device monitoring
- Safety violation alerts

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use MongoDB Atlas for database
3. Configure proper JWT secrets
4. Set up SSL/TLS certificates
5. Use PM2 for process management
6. Configure reverse proxy (nginx)

### Docker Deployment
```bash
# Build image
docker build -t sentry-backend .

# Run container
docker run -p 3001:3001 --env-file .env sentry-backend
```

## 📝 API Documentation

Full API documentation is available at `/api/docs` when running in development mode.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.