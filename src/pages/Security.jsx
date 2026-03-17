import { useState } from "react";
import { Shield, Camera, AlertTriangle, CheckCircle, Battery, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
const mockSensors = [
  {
    id: "1",
    name: "Front Door",
    type: "door",
    room: "Entrance",
    status: "normal",
    batteryLevel: 85,
    isArmed: true,
    espId: "ESP32_SEC_001"
  },
  {
    id: "2",
    name: "Living Room Motion",
    type: "motion",
    room: "Living Room",
    status: "normal",
    batteryLevel: 92,
    isArmed: true,
    espId: "ESP32_SEC_002"
  },
  {
    id: "3",
    name: "Kitchen Smoke Detector",
    type: "smoke",
    room: "Kitchen",
    status: "normal",
    batteryLevel: 78,
    isArmed: true,
    espId: "ESP32_SEC_003"
  },
  {
    id: "4",
    name: "Basement Water Sensor",
    type: "water",
    room: "Basement",
    status: "triggered",
    batteryLevel: 65,
    isArmed: true,
    lastTriggered: new Date(Date.now() - 2 * 60 * 1e3),
    espId: "ESP32_SEC_004"
  }
];
const mockAlerts = [
  {
    id: "1",
    sensorId: "4",
    type: "water",
    severity: "high",
    message: "Water detected in basement",
    timestamp: new Date(Date.now() - 2 * 60 * 1e3),
    acknowledged: false,
    location: "Basement"
  },
  {
    id: "2",
    sensorId: "2",
    type: "intrusion",
    severity: "medium",
    message: "Motion detected in living room",
    timestamp: new Date(Date.now() - 15 * 60 * 1e3),
    acknowledged: true,
    location: "Living Room"
  }
];
const Security = () => {
  const [sensors, setSensors] = useState(mockSensors);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [systemArmed, setSystemArmed] = useState(true);
  const getSensorIcon = (type) => {
    switch (type) {
      case "motion":
        return "\u{1F6B6}";
      case "door":
        return "\u{1F6AA}";
      case "window":
        return "\u{1FA9F}";
      case "camera":
        return "\u{1F4F9}";
      case "smoke":
        return "\u{1F525}";
      case "gas":
        return "\u26FD";
      case "water":
        return "\u{1F4A7}";
      case "air_quality":
        return "\u{1F32C}\uFE0F";
      default:
        return "\u{1F512}";
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "normal":
        return "text-green-600 dark:text-green-400";
      case "triggered":
        return "text-red-600 dark:text-red-400";
      case "offline":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };
  const toggleSystemArmed = () => {
    setSystemArmed(!systemArmed);
    toast.success(systemArmed ? "Security system disarmed" : "Security system armed");
  };
  const toggleSensorArmed = (sensorId) => {
    setSensors((prev) => prev.map(
      (sensor) => sensor.id === sensorId ? { ...sensor, isArmed: !sensor.isArmed } : sensor
    ));
  };
  const acknowledgeAlert = (alertId) => {
    setAlerts((prev) => prev.map(
      (alert) => alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
    toast.success("Alert acknowledged");
  };
  const activeAlerts = alerts.filter((alert) => !alert.acknowledged);
  const triggeredSensors = sensors.filter((sensor) => sensor.status === "triggered");
  return <div className="space-y-6">{
    /* Header */
  }<div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Center</h1><p className="text-gray-600 dark:text-gray-400">Advanced home protection and intrusion detection</p></div><motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={toggleSystemArmed}
    className={`flex items-center px-6 py-3 rounded-lg font-medium ${systemArmed ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
  ><Shield className="h-5 w-5 mr-2" />{systemArmed ? "Disarm System" : "Arm System"}</motion.button></div>{
    /* System Status */
  }<div className="grid grid-cols-1 md:grid-cols-4 gap-6"><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center"><div className={`w-12 h-12 rounded-lg flex items-center justify-center ${systemArmed ? "bg-red-100 dark:bg-red-900/30" : "bg-green-100 dark:bg-green-900/30"}`}><Shield className={`h-6 w-6 ${systemArmed ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`} /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p><p className={`text-lg font-semibold ${systemArmed ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>{systemArmed ? "Armed" : "Disarmed"}</p></div></div></div><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center"><div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><Camera className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Sensors</p><p className="text-lg font-semibold text-gray-900 dark:text-white">{sensors.filter((s) => s.isArmed).length}/{sensors.length}</p></div></div></div><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center"><div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p><p className="text-lg font-semibold text-gray-900 dark:text-white">{activeAlerts.length}</p></div></div></div><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center"><div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"><CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online Sensors</p><p className="text-lg font-semibold text-gray-900 dark:text-white">{sensors.filter((s) => s.status !== "offline").length}</p></div></div></div></div>{
    /* Active Alerts */
  }{activeAlerts.length > 0 && <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Alerts</h2><div className="space-y-3">{activeAlerts.map((alert) => <motion.div
    key={alert.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20"
  ><div className="flex items-center"><AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" /><div><p className="font-medium text-red-900 dark:text-red-100">{alert.message}</p><p className="text-sm text-red-700 dark:text-red-300">{alert.location} • {alert.timestamp.toLocaleTimeString()}</p></div></div><div className="flex items-center space-x-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>{alert.severity.toUpperCase()}</span><button
    onClick={() => acknowledgeAlert(alert.id)}
    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
  >
                    Acknowledge
                  </button></div></motion.div>)}</div></div>}{
    /* Sensors Grid */
  }<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Sensors</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{sensors.map((sensor) => <motion.div
    key={sensor.id}
    whileHover={{ scale: 1.02 }}
    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
  ><div className="flex items-start justify-between mb-3"><div className="flex items-center"><span className="text-2xl mr-3">{getSensorIcon(sensor.type)}</span><div><h3 className="font-medium text-gray-900 dark:text-white">{sensor.name}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{sensor.room}</p></div></div><button
    onClick={() => toggleSensorArmed(sensor.id)}
    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
  >{sensor.isArmed ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button></div><div className="space-y-2"><div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Status</span><span className={`text-sm font-medium ${getStatusColor(sensor.status)}`}>{sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)}</span></div>{sensor.batteryLevel && <div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Battery</span><div className="flex items-center"><Battery className="h-4 w-4 text-gray-400 mr-1" /><span className="text-sm text-gray-900 dark:text-white">{sensor.batteryLevel}%</span></div></div>}<div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Armed</span><span className={`text-sm font-medium ${sensor.isArmed ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}`}>{sensor.isArmed ? "Yes" : "No"}</span></div>{sensor.lastTriggered && <div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Last Triggered</span><span className="text-sm text-gray-900 dark:text-white">{sensor.lastTriggered.toLocaleTimeString()}</span></div>}</div></motion.div>)}</div></div></div>;
};
export {
  Security
};
