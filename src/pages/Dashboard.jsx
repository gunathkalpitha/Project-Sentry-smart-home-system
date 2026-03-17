import { useState } from "react";
import { useDevices } from "../hooks/useDevices";
import { StatsCard } from "../components/Dashboard/StatsCard";
import { DeviceCard } from "../components/Dashboard/DeviceCard";
import { EnergyChart } from "../components/Charts/EnergyChart";
import { DeviceSettingsModal } from "../components/Modals/DeviceSettingsModal";
import { AIAssistant } from "../components/AIAssistant/AIAssistant";
import {
  Zap,
  Power,
  TrendingUp,
  Shield,
  Plus,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
const mockChartData = [
  { timestamp: new Date(Date.now() - 7 * 60 * 1e3), power: 120, current: 2.1, voltage: 240 },
  { timestamp: new Date(Date.now() - 6 * 60 * 1e3), power: 135, current: 2.3, voltage: 242 },
  { timestamp: new Date(Date.now() - 5 * 60 * 1e3), power: 140, current: 2.4, voltage: 238 },
  { timestamp: new Date(Date.now() - 4 * 60 * 1e3), power: 128, current: 2.2, voltage: 241 },
  { timestamp: new Date(Date.now() - 3 * 60 * 1e3), power: 142, current: 2.5, voltage: 239 },
  { timestamp: new Date(Date.now() - 2 * 60 * 1e3), power: 138, current: 2.4, voltage: 240 },
  { timestamp: new Date(Date.now() - 1 * 60 * 1e3), power: 145, current: 2.6, voltage: 243 },
  { timestamp: /* @__PURE__ */ new Date(), power: 132, current: 2.3, voltage: 241 }
];
const Dashboard = () => {
  const { devices, loading, toggleDevice, updateSafetyLimits } = useDevices();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [filterRoom, setFilterRoom] = useState("all");
  const handleDeviceSettings = (device) => {
    setSelectedDevice(device);
    setIsSettingsModalOpen(true);
  };
  const handleSaveSettings = (deviceId, limits) => {
    updateSafetyLimits(deviceId, limits);
  };
  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status === "online").length;
  const totalPower = devices.reduce((sum, d) => sum + d.powerConsumption, 0);
  const safetyAlerts = devices.filter(
    (d) => d.currentReading > d.maxCurrent || d.voltageReading > d.maxVoltage
  ).length;
  const rooms = ["all", ...new Set(devices.map((d) => d.room))];
  const filteredDevices = filterRoom === "all" ? devices : devices.filter((d) => d.room === filterRoom);
  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }
  return <div className="space-y-6">{
    /* Header */
  }<div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sentry Dashboard</h1><p className="text-gray-600 dark:text-gray-400">Monitor and protect your smart home with advanced security</p></div><Link to="/devices"><motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
  ><Plus className="h-4 w-4 mr-2" />
            Add Device
          </motion.button></Link></div>{
    /* Stats Cards */
  }<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><StatsCard
    title="Total Devices"
    value={totalDevices.toString()}
    change={`${onlineDevices} online`}
    changeType="positive"
    icon={Zap}
    color="blue"
  /><StatsCard
    title="Total Power"
    value={`${totalPower.toFixed(1)}W`}
    change="+5.2% vs last hour"
    changeType="positive"
    icon={Power}
    color="green"
  /><StatsCard
    title="Energy Today"
    value="24.3 kWh"
    change="-2.1% vs yesterday"
    changeType="negative"
    icon={TrendingUp}
    color="yellow"
  /><StatsCard
    title="Safety Alerts"
    value={safetyAlerts.toString()}
    change={safetyAlerts === 0 ? "All systems normal" : "Requires attention"}
    changeType={safetyAlerts === 0 ? "positive" : "negative"}
    icon={Shield}
    color={safetyAlerts === 0 ? "green" : "red"}
  /></div>{
    /* Energy Chart */
  }<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Real-time Energy Monitor</h2><select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"><option>Last Hour</option><option>Last 6 Hours</option><option>Last 24 Hours</option></select></div><EnergyChart data={mockChartData} height={400} /></div>{
    /* Device Controls */
  }<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Device Control</h2><div className="flex items-center space-x-3"><select
    value={filterRoom}
    onChange={(e) => setFilterRoom(e.target.value)}
    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
  >{rooms.map((room) => <option key={room} value={room}>{room === "all" ? "All Rooms" : room}</option>)}</select><button className="flex items-center px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><Filter className="h-4 w-4 mr-1" />
              Filter
            </button></div></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredDevices.map((device) => <DeviceCard
    key={device.id}
    device={device}
    onToggle={toggleDevice}
    onSettings={handleDeviceSettings}
  />)}</div>{filteredDevices.length === 0 && <div className="text-center py-8"><p className="text-gray-500 dark:text-gray-400">No devices found in the selected room.</p></div>}</div>{
    /* Device Settings Modal */
  }<DeviceSettingsModal
    device={selectedDevice}
    isOpen={isSettingsModalOpen}
    onClose={() => setIsSettingsModalOpen(false)}
    onSave={handleSaveSettings}
  />{
    /* AI Assistant */
  }<AIAssistant /></div>;
};
export {
  Dashboard
};
