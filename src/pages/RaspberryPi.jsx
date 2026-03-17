import { useState } from "react";
import { Cpu, Wifi, Thermometer, HardDrive, Activity, Plus, Settings, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { raspberryPiApi } from "../services/api";
import toast from "react-hot-toast";
const mockRaspberryPis = [
  {
    id: "1",
    name: "Main Hub",
    piId: "RPI_001",
    ipAddress: "192.168.1.100",
    macAddress: "00:1B:44:11:3A:B7",
    status: "online",
    location: "Living Room",
    version: "1.2.3",
    connectedESPs: [
      { espId: "ESP32_001", status: "online", lastSeen: /* @__PURE__ */ new Date(), signalStrength: 85 },
      { espId: "ESP32_002", status: "online", lastSeen: /* @__PURE__ */ new Date(), signalStrength: 72 },
      { espId: "ESP32_003", status: "offline", lastSeen: new Date(Date.now() - 5 * 60 * 1e3), signalStrength: 0 }
    ],
    systemInfo: {
      cpuUsage: 45,
      memoryUsage: 62,
      temperature: 52,
      uptime: 86400,
      diskUsage: 78
    },
    networkInfo: {
      wifiSSID: "HomeNetwork_5G",
      signalStrength: 88,
      bandwidth: 150
    },
    configuration: {
      mqttBroker: "mqtt://192.168.1.100:1883",
      updateInterval: 30,
      maxESPs: 20,
      autoUpdate: true
    },
    lastHeartbeat: /* @__PURE__ */ new Date(),
    connectedDeviceCount: 6
  },
  {
    id: "2",
    name: "Garage Hub",
    piId: "RPI_002",
    ipAddress: "192.168.1.101",
    macAddress: "00:1B:44:11:3A:B8",
    status: "online",
    location: "Garage",
    version: "1.2.3",
    connectedESPs: [
      { espId: "ESP32_004", status: "online", lastSeen: /* @__PURE__ */ new Date(), signalStrength: 68 },
      { espId: "ESP32_005", status: "online", lastSeen: /* @__PURE__ */ new Date(), signalStrength: 75 }
    ],
    systemInfo: {
      cpuUsage: 32,
      memoryUsage: 48,
      temperature: 48,
      uptime: 172800,
      diskUsage: 45
    },
    networkInfo: {
      wifiSSID: "HomeNetwork_5G",
      signalStrength: 65,
      bandwidth: 120
    },
    configuration: {
      mqttBroker: "mqtt://192.168.1.100:1883",
      updateInterval: 30,
      maxESPs: 15,
      autoUpdate: true
    },
    lastHeartbeat: /* @__PURE__ */ new Date(),
    connectedDeviceCount: 3
  }
];
const RaspberryPiPage = () => {
  const [raspberryPis, setRaspberryPis] = useState(mockRaspberryPis);
  const [loading, setLoading] = useState(false);
  const [selectedPi, setSelectedPi] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "offline":
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
      case "error":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      case "updating":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
    }
  };
  const getSystemHealthColor = (usage) => {
    if (usage < 50) return "text-green-600 dark:text-green-400";
    if (usage < 80) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds % 86400 / 3600);
    return `${days}d ${hours}h`;
  };
  const handleScanESP = async (piId) => {
    try {
      await raspberryPiApi.scanESP(piId);
      toast.success("ESP32 scan initiated");
    } catch (error) {
      toast.error("Failed to initiate ESP scan");
    }
  };
  const handleRestartPi = (piId) => {
    toast.success(`Restart command sent to ${piId}`);
  };
  return <div className="space-y-6">{
    /* Header */
  }<div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Raspberry Pi Hubs</h1><p className="text-gray-600 dark:text-gray-400">Manage your Sentry system's Raspberry Pi gateway units</p></div><motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setShowAddModal(true)}
    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
  ><Plus className="h-4 w-4 mr-2" />
          Add Raspberry Pi
        </motion.button></div>{
    /* Stats Overview */
  }<div className="grid grid-cols-1 md:grid-cols-4 gap-6"><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center"><div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"><Cpu className="h-6 w-6 text-green-600 dark:text-green-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hubs</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{raspberryPis.length}</p></div></div></div><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center"><div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online Hubs</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{raspberryPis.filter((pi) => pi.status === "online").length}</p></div></div></div><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center"><div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center"><Wifi className="h-6 w-6 text-purple-600 dark:text-purple-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Connected ESPs</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{raspberryPis.reduce((sum, pi) => sum + pi.connectedESPs.filter((esp) => esp.status === "online").length, 0)}</p></div></div></div><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center"><div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center"><HardDrive className="h-6 w-6 text-yellow-600 dark:text-yellow-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Devices</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{raspberryPis.reduce((sum, pi) => sum + (pi.connectedDeviceCount || 0), 0)}</p></div></div></div></div>{
    /* Raspberry Pi Cards */
  }<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{raspberryPis.map((pi) => <motion.div
    key={pi.id}
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  >{
    /* Header */
  }<div className="flex items-start justify-between mb-4"><div className="flex items-center"><div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center"><Cpu className="h-6 w-6 text-white" /></div><div className="ml-4"><h3 className="text-lg font-semibold text-gray-900 dark:text-white">{pi.name}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{pi.location} • {pi.piId}</p></div></div><div className="flex items-center space-x-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pi.status)}`}>{pi.status.toUpperCase()}</span><div className="flex space-x-1"><button
    onClick={() => handleScanESP(pi.id)}
    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
    title="Scan for ESP32 devices"
  ><RefreshCw className="h-4 w-4" /></button><button
    onClick={() => setSelectedPi(pi)}
    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
    title="Settings"
  ><Settings className="h-4 w-4" /></button></div></div></div>{
    /* System Info */
  }<div className="grid grid-cols-2 gap-4 mb-4"><div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">CPU</span><span className={`text-sm font-medium ${getSystemHealthColor(pi.systemInfo.cpuUsage)}`}>{pi.systemInfo.cpuUsage}%
                  </span></div><div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2"><div
    className={`h-2 rounded-full ${pi.systemInfo.cpuUsage < 50 ? "bg-green-500" : pi.systemInfo.cpuUsage < 80 ? "bg-yellow-500" : "bg-red-500"}`}
    style={{ width: `${pi.systemInfo.cpuUsage}%` }}
  /></div></div><div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Memory</span><span className={`text-sm font-medium ${getSystemHealthColor(pi.systemInfo.memoryUsage)}`}>{pi.systemInfo.memoryUsage}%
                  </span></div><div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2"><div
    className={`h-2 rounded-full ${pi.systemInfo.memoryUsage < 50 ? "bg-green-500" : pi.systemInfo.memoryUsage < 80 ? "bg-yellow-500" : "bg-red-500"}`}
    style={{ width: `${pi.systemInfo.memoryUsage}%` }}
  /></div></div><div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><div className="flex items-center justify-between"><div className="flex items-center"><Thermometer className="h-4 w-4 text-gray-400 mr-1" /><span className="text-sm text-gray-600 dark:text-gray-400">Temp</span></div><span className={`text-sm font-medium ${getSystemHealthColor(pi.systemInfo.temperature)}`}>{pi.systemInfo.temperature}°C
                  </span></div></div><div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span><span className="text-sm font-medium text-gray-900 dark:text-white">{formatUptime(pi.systemInfo.uptime)}</span></div></div></div>{
    /* Network Info */
  }<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4"><div className="flex items-center justify-between"><div className="flex items-center"><Wifi className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" /><span className="text-sm font-medium text-blue-900 dark:text-blue-100">{pi.networkInfo.wifiSSID}</span></div><div className="flex items-center space-x-2"><span className="text-sm text-blue-700 dark:text-blue-300">{pi.networkInfo.signalStrength}%
                  </span><span className="text-sm text-blue-700 dark:text-blue-300">{pi.networkInfo.bandwidth} Mbps
                  </span></div></div></div>{
    /* Connected ESPs */
  }<div><div className="flex items-center justify-between mb-2"><h4 className="text-sm font-medium text-gray-900 dark:text-white">Connected ESP32 Devices</h4><span className="text-sm text-gray-600 dark:text-gray-400">{pi.connectedESPs.filter((esp) => esp.status === "online").length}/{pi.connectedESPs.length}</span></div><div className="space-y-2">{pi.connectedESPs.slice(0, 3).map((esp, index) => <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded"><div className="flex items-center"><div className={`w-2 h-2 rounded-full mr-2 ${esp.status === "online" ? "bg-green-500" : "bg-gray-400"}`} /><span className="text-sm text-gray-900 dark:text-white">{esp.espId}</span></div><span className="text-sm text-gray-600 dark:text-gray-400">{esp.signalStrength}%
                    </span></div>)}{pi.connectedESPs.length > 3 && <div className="text-center"><span className="text-sm text-gray-500 dark:text-gray-400">
                      +{pi.connectedESPs.length - 3} more devices
                    </span></div>}</div></div></motion.div>)}</div>{raspberryPis.length === 0 && <div className="text-center py-12"><div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4"><Cpu className="h-8 w-8 text-gray-400" /></div><h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Raspberry Pi Hubs</h3><p className="text-gray-500 dark:text-gray-400 mb-4">
            Add your first Raspberry Pi hub to start managing ESP32 devices
          </p><button
    onClick={() => setShowAddModal(true)}
    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
  ><Plus className="h-4 w-4 mr-2" />
            Add Raspberry Pi Hub
          </button></div>}</div>;
};
export {
  RaspberryPiPage
};
