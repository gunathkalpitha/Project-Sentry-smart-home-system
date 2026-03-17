const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Device = require('../models/Device');
const RaspberryPi = require('../models/RaspberryPi');

const socketHandler = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;

      // If no token provided, allow a guest connection (read-only/public events)
      if (!token) {
        socket.isGuest = true;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return next(new Error('Invalid user'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      socket.isGuest = false;
      next();
    } catch (error) {
      // If token verification fails, allow guest but log the reason
      console.warn('Socket auth verification failed:', error && error.message ? error.message : error);
      socket.isGuest = true;
      next();
    }
  });
  
  io.on('connection', (socket) => {
    if (socket.isGuest) {
      console.log(`🔌 Guest socket connected (${socket.id})`);
    } else {
      console.log(`🔌 User ${socket.user.name} connected (${socket.id})`);
      // Join user-specific room
      socket.join(`user_${socket.userId}`);
      // On connect, emit current wifi-connected lists for any SSIDs the user's devices belong to
      (async () => {
        try {
          const userDevices = await Device.find({ userId: socket.userId }).select('espId wifiNetwork status');
          const ssidGroups = {};
          userDevices.forEach(d => {
            if (d.wifiNetwork) {
              if (!ssidGroups[d.wifiNetwork]) ssidGroups[d.wifiNetwork] = [];
              if (d.status === 'online') ssidGroups[d.wifiNetwork].push(d.espId);
            }
          });
          // Emit for each SSID
          for (const ssid of Object.keys(ssidGroups)) {
            socket.emit('wifi-connected', ssidGroups[ssid]);
          }
        } catch (err) {
          console.error('Error emitting initial wifi-connected state', err);
        }
      })();
    }
    
    // Handle device commands from frontend
    socket.on('device-command', async (data) => {
      try {
        const { deviceId, command, params } = data;
        
        // Verify device ownership
        const device = await Device.findOne({ 
          _id: deviceId, 
          userId: socket.userId 
        });
        
        if (!device) {
          socket.emit('error', { message: 'Device not found' });
          return;
        }
        
        console.log(`📡 Device command: ${command} for ${device.name}`);
        
        // Process command
        switch (command) {
          case 'toggle':
            device.isOn = !device.isOn;
            device.powerConsumption = device.isOn ? Math.random() * 200 + 50 : 0;
            device.currentReading = device.isOn ? Math.random() * 10 + 1 : 0;
            break;
            
          case 'update-safety':
            device.maxCurrent = params.maxCurrent;
            device.maxVoltage = params.maxVoltage;
            break;
            
          default:
            socket.emit('error', { message: 'Unknown command' });
            return;
        }
        
        device.lastUpdated = new Date();
        await device.save();
        
        // Emit update to all user's connected clients
        io.to(`user_${socket.userId}`).emit('device-update', device);
        
        // Check for safety violations
        if (device.currentReading > device.maxCurrent || 
            device.voltageReading > device.maxVoltage) {
          io.to(`user_${socket.userId}`).emit('safety-alert', {
            deviceId: device._id,
            deviceName: device.name,
            type: device.currentReading > device.maxCurrent ? 'current' : 'voltage',
            value: device.currentReading > device.maxCurrent ? device.currentReading : device.voltageReading,
            limit: device.currentReading > device.maxCurrent ? device.maxCurrent : device.maxVoltage
          });
        }
        
      } catch (error) {
        console.error('Socket command error:', error);
        socket.emit('error', { message: 'Command failed' });
      }
    });
    
    // Handle ESP32 device data (simulated)
    socket.on('raspberrypi-data', async (data) => {
      try {
        const { piId, systemInfo, connectedESPs, sensorData } = data;
        
        // Update Raspberry Pi status
        const raspberryPi = await RaspberryPi.findOneAndUpdate(
          { piId },
          { 
            status: 'online',
            lastHeartbeat: new Date(),
            systemInfo: systemInfo || {},
            connectedESPs: connectedESPs || {}
          },
          { new: true }
        );
        
        if (raspberryPi) {
          // Emit Pi status update
          io.to(`user_${raspberryPi.userId}`).emit('raspberrypi-update', raspberryPi);
          
          // Process sensor data from connected ESP32 devices
          if (sensorData && sensorData.length > 0) {
            for (const espData of sensorData) {
              const device = await Device.findOne({ 
                espId: espData.espId, 
                raspberryPiId: raspberryPi._id 
              });
              
              if (device) {
                device.currentReading = espData.current;
                device.voltageReading = espData.voltage;
                device.powerConsumption = espData.power;
                device.status = 'online';
                device.lastUpdated = new Date();
                
                await device.save();
                
                // Emit real-time sensor data
                io.to(`user_${raspberryPi.userId}`).emit('sensor-reading', {
                  deviceId: device._id,
                  current: espData.current,
                  voltage: espData.voltage,
                  power: espData.power,
                  timestamp: new Date()
                });
                
                // Check safety limits
                if (espData.current > device.maxCurrent || espData.voltage > device.maxVoltage) {
                  io.to(`user_${raspberryPi.userId}`).emit('safety-alert', {
                    deviceId: device._id,
                    deviceName: device.name,
                    piId: raspberryPi.piId,
                    type: espData.current > device.maxCurrent ? 'current' : 'voltage',
                    value: espData.current > device.maxCurrent ? espData.current : espData.voltage,
                    limit: espData.current > device.maxCurrent ? device.maxCurrent : device.maxVoltage
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Raspberry Pi data error:', error);
      }
    });
    
    // Handle individual ESP32 device data (legacy support)
    socket.on('esp32-data', async (data) => {
      try {
        const { espId, current, voltage, power, piId } = data;
        
        const device = await Device.findOne({ 
          espId,
          userId: socket.userId 
        });
        
        if (device) {
          device.currentReading = current;
          device.voltageReading = voltage;
          device.powerConsumption = power;
          device.status = 'online';
          device.lastUpdated = new Date();
          
          await device.save();
          
          // Emit real-time sensor data
          io.to(`user_${socket.userId}`).emit('sensor-reading', {
            deviceId: device._id,
            current,
            voltage,
            power,
            timestamp: new Date()
          });
          
          // Check safety limits
          if (current > device.maxCurrent || voltage > device.maxVoltage) {
            io.to(`user_${socket.userId}`).emit('safety-alert', {
              deviceId: device._id,
              deviceName: device.name,
              piId: piId || 'unknown',
              type: current > device.maxCurrent ? 'current' : 'voltage',
              value: current > device.maxCurrent ? current : voltage,
              limit: current > device.maxCurrent ? device.maxCurrent : device.maxVoltage
            });
          }
        }
      } catch (error) {
        console.error('ESP32 data error:', error);
      }
    });
    
    // Handle Raspberry Pi commands
    socket.on('raspberrypi-command', async (data) => {
      try {
        const { piId, command, params } = data;
        
        const raspberryPi = await RaspberryPi.findOne({ 
          piId, 
          userId: socket.userId 
        });
        
        if (!raspberryPi) {
          socket.emit('error', { message: 'Raspberry Pi not found' });
          return;
        }
        
        console.log(`📡 Raspberry Pi command: ${command} for ${raspberryPi.name}`);
        
        // Emit command to specific Raspberry Pi
        io.emit('pi-command', {
          piId: raspberryPi.piId,
          command,
          params
        });
        
        socket.emit('command-sent', { 
          piId: raspberryPi.piId, 
          command, 
          status: 'sent' 
        });
        
      } catch (error) {
        console.error('Raspberry Pi command error:', error);
        socket.emit('error', { message: 'Command failed' });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.isGuest) {
        console.log(`🔌 Guest socket disconnected (${socket.id})`);
      } else {
        console.log(`🔌 User ${socket.user.name} disconnected (${socket.id})`);
      }
    });
  });
  
  // Simulate real-time data updates (for demo purposes)
  setInterval(() => {
    simulateDeviceUpdates(io);
  }, 30000); // Every 30 seconds
};

// Simulate device data updates
const simulateDeviceUpdates = async (io) => {
  try {
    const onlineDevices = await Device.find({ status: 'online' })
      .populate('userId')
      .populate('raspberryPiId');
    
    for (const device of onlineDevices) {
      if (device.isOn) {
        // Simulate slight variations in readings
        device.currentReading += (Math.random() - 0.5) * 0.5;
        device.voltageReading += (Math.random() - 0.5) * 2;
        device.powerConsumption = device.currentReading * device.voltageReading;
        
        // Keep readings within reasonable bounds
        device.currentReading = Math.max(0, Math.min(device.currentReading, 20));
        device.voltageReading = Math.max(220, Math.min(device.voltageReading, 250));
        
        device.lastUpdated = new Date();
        await device.save();
        
        // Emit to user's room
        io.to(`user_${device.userId._id}`).emit('sensor-reading', {
          deviceId: device._id,
          current: device.currentReading,
          voltage: device.voltageReading,
          power: device.powerConsumption,
          timestamp: new Date()
        });
      }
    }
  } catch (error) {
    console.error('Simulation error:', error);
  }
};

module.exports = socketHandler;