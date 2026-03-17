import { useState } from "react";
import { useDevices } from "../hooks/useDevices";
import { DeviceCard } from "../components/Dashboard/DeviceCard";
import { DeviceSettingsModal } from "../components/Modals/DeviceSettingsModal";
import { AddDeviceModal } from "../components/Modals/AddDeviceModal";
import {
  Plus,
  Filter,
  Search,
  Zap,
  Power,
  Shield,
  AlertTriangle,
  Wifi
} from "lucide-react";
import { motion } from "framer-motion";
const Devices = () => {
  const { devices, loading, toggleDevice, updateSafetyLimits, addDevice } = useDevices();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterRoom, setFilterRoom] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const handleDeviceSettings = (device) => {
    setSelectedDevice(device);
    setIsSettingsModalOpen(true);
  };
  const handleSaveSettings = (deviceId, limits) => {
    updateSafetyLimits(deviceId, limits);
  };
  const handleAddDevice = (deviceData) => {
    addDevice(deviceData);
  };
  const filteredDevices = devices.filter((device) => {
    const name = device && device.name ? String(device.name) : "";
    const room = device && device.room ? String(device.room) : "";
    const status = device && device.status ? String(device.status) : "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoom = filterRoom === "all" || room === filterRoom;
    const matchesStatus = filterStatus === "all" || status === filterStatus;
    return matchesSearch && matchesRoom && matchesStatus;
  });
  const rooms = ["all", ...Array.from(new Set(devices.map((d) => d.room).filter(Boolean)))];
  const statuses = ["all", "online", "offline", "error"];
  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status === "online").length;
  const totalPower = devices.reduce((sum, d) => sum + (Number(d.powerConsumption) || 0), 0);
  const safetyAlerts = devices.filter((d) => {
    const current = Number(d.currentReading) || 0;
    const voltage = Number(d.voltageReading) || 0;
    const maxCurrent = Number(d.maxCurrent) || Infinity;
    const maxVoltage = Number(d.maxVoltage) || Infinity;
    return current > maxCurrent || voltage > maxVoltage;
  }).length;
  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }
  return <div className="space-y-6">{
    /* Header */
  }<div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Device Management</h1><p className="text-gray-600 dark:text-gray-400">Monitor and control all your Sentry-protected devices</p></div><motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setIsAddModalOpen(true)}
    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
  ><Plus className="h-4 w-4 mr-2" />
          Add Device
        </motion.button></div>{
    /* Stats Cards */
  }<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center"><div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Devices</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalDevices}</p></div></div></div><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center"><div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"><Wifi className="h-6 w-6 text-green-600 dark:text-green-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{onlineDevices}</p></div></div></div><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center"><div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center"><Power className="h-6 w-6 text-yellow-600 dark:text-yellow-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Power</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalPower.toFixed(1)}W</p></div></div></div><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center"><div className={`w-12 h-12 rounded-lg flex items-center justify-center ${safetyAlerts > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-green-100 dark:bg-green-900/30"}`}>{safetyAlerts > 0 ? <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" /> : <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />}</div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Safety Alerts</p><p className={`text-2xl font-semibold ${safetyAlerts > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>{safetyAlerts}</p></div></div></div></div>{
    /* Filters and Search */
  }<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0"><div className="flex items-center space-x-4"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><input
    type="text"
    placeholder="Search devices..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
  /></div></div><div className="flex items-center space-x-3"><select
    value={filterRoom}
    onChange={(e) => setFilterRoom(e.target.value)}
    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  >{rooms.map((room) => <option key={room} value={room}>{room === "all" ? "All Rooms" : room}</option>)}</select><select
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  >{statuses.map((status) => <option key={status} value={status}>{status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</select><button className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"><Filter className="h-4 w-4 mr-1" />
              Filter
            </button></div></div></div>{
    /* Device Grid */
  }<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Devices ({filteredDevices.length})
          </h2><div className="text-sm text-gray-500 dark:text-gray-400">{onlineDevices} online • {devices.length - onlineDevices} offline
          </div></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredDevices.map((device, idx) => <DeviceCard
    key={device.id ?? device._id ?? idx}
    device={device}
    onToggle={toggleDevice}
    onSettings={handleDeviceSettings}
  />)}</div>{filteredDevices.length === 0 && <div className="text-center py-12"><div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4"><Zap className="h-8 w-8 text-gray-400" /></div><h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No devices found</h3><p className="text-gray-500 dark:text-gray-400 mb-4">{searchTerm || filterRoom !== "all" || filterStatus !== "all" ? "Try adjusting your search or filters" : "Get started by adding your first device"}</p>{!searchTerm && filterRoom === "all" && filterStatus === "all" && <button
    onClick={() => setIsAddModalOpen(true)}
    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
  ><Plus className="h-4 w-4 mr-2" />
                Add Your First Device
              </button>}</div>}</div>{
    /* Device Settings Modal */
  }<DeviceSettingsModal
    device={selectedDevice}
    isOpen={isSettingsModalOpen}
    onClose={() => setIsSettingsModalOpen(false)}
    onSave={handleSaveSettings}
  />{
    /* Add Device Modal */
  }<AddDeviceModal
    isOpen={isAddModalOpen}
    onClose={() => setIsAddModalOpen(false)}
    onSave={handleAddDevice}
  /></div>;
};
export {
  Devices
};
