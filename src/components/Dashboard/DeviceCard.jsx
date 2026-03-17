import { useEffect, useState } from "react";
import { Power, Wifi, WifiOff, Settings, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { sensorApi } from "../../services/api";
const DeviceCard = ({ device, onToggle, onSettings }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [energyKWh, setEnergyKWh] = useState(null);
  const [recentAvgW, setRecentAvgW] = useState(null);
  useEffect(() => {
    let mounted = true;
    const id = device.id || device._id;
    if (!id) return;
    (async () => {
      try {
        const resp = await sensorApi.getSummary(id, "day");
        if (!mounted) return;
        if (resp && resp.data && resp.data.metrics) {
          setEnergyKWh(resp.data.metrics.totalEnergyKWh || 0);
        }
      } catch (err) {
      }
    })();
    return () => {
      mounted = false;
    };
  }, [device]);
  useEffect(() => {
    let mounted = true;
    const id = device.id || device._id;
    if (!id) return;
    const fetchRecent = async () => {
      try {
        const resp = await sensorApi.getRecentSummary(id, 5);
        if (!mounted) return;
        if (resp && resp.data && resp.data.metrics) {
          setRecentAvgW(resp.data.metrics.avgPowerW || 0);
        }
      } catch (err) {
      }
    };
    fetchRecent();
    const iv = setInterval(fetchRecent, 5e3);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, [device]);
  const handleToggle = async () => {
    setIsLoading(true);
    const id = device.id || device._id;
    await onToggle(id);
    setTimeout(() => setIsLoading(false), 1e3);
  };
  const getStatusColor = () => {
    if (device.status === "offline") return "bg-gray-500";
    if (device.status === "error") return "bg-red-500";
    return device.isOn ? "bg-green-500" : "bg-gray-400";
  };
  const getStatusIcon = () => {
    if (device.status === "offline") return <WifiOff className="h-4 w-4" />;
    if (device.signalStrength && device.signalStrength > 50) return <Wifi className="h-4 w-4" />;
    return <Wifi className="h-4 w-4 opacity-50" />;
  };
  const currentReading = device.isOn ? Number(device.currentReading) || 0 : Number(device.lastNonZeroCurrent) || 0;
  const voltageReading = device.isOn ? Number(device.voltageReading) || 0 : Number(device.lastNonZeroVoltage) || 0;
  let powerConsumption = 0;
  if (recentAvgW !== null && !isNaN(recentAvgW) && recentAvgW > 0) {
    powerConsumption = recentAvgW;
  } else if (device.powerConsumption && !isNaN(Number(device.powerConsumption)) && Number(device.powerConsumption) > 0) {
    powerConsumption = Number(device.powerConsumption);
  } else if (currentReading > 0 && voltageReading > 0) {
    powerConsumption = currentReading * voltageReading;
  } else {
    powerConsumption = Number(device.lastNonZeroPower) || 0;
  }
  const isOverLimit = currentReading > (Number(device.maxCurrent) || Infinity) || voltageReading > (Number(device.maxVoltage) || Infinity);
  return <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  ><div className="flex items-start justify-between"><div className="flex items-center"><div className={`w-3 h-3 rounded-full ${getStatusColor()}`} /><div className="ml-3"><h3 className="text-lg font-semibold text-gray-900 dark:text-white">{device.name}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{device.room}</p></div></div><div className="flex items-center space-x-2">{getStatusIcon()}<button
    onClick={() => onSettings(device)}
    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
  ><Settings className="h-4 w-4" /></button></div></div><div className="mt-4 grid grid-cols-2 gap-4"><div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Current</p><div className="flex items-center"><p className={`text-lg font-semibold ${device.currentReading > device.maxCurrent ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>{currentReading.toFixed(2)}A
            </p>{device.currentReading > device.maxCurrent && <AlertTriangle className="ml-1 h-4 w-4 text-red-500" />}</div><p className="text-xs text-gray-500 dark:text-gray-400">
            Max: {device.maxCurrent}A
          </p></div><div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Voltage</p><div className="flex items-center"><p className={`text-lg font-semibold ${voltageReading > (Number(device.maxVoltage) || Infinity) ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>{voltageReading.toFixed(1)}V
            </p>{device.voltageReading > device.maxVoltage && <AlertTriangle className="ml-1 h-4 w-4 text-red-500" />}</div><p className="text-xs text-gray-500 dark:text-gray-400">
            Max: {device.maxVoltage}V
          </p></div></div><div className="mt-4 flex items-center justify-between"><div><p className="text-sm font-medium text-gray-900 dark:text-white">{Number.isFinite(powerConsumption) ? `${powerConsumption.toFixed(1)}W` : "0.0W"}</p><p className="text-xs text-gray-600 dark:text-gray-400">Power consumption</p>{energyKWh !== null && <p className="text-xs text-gray-500 dark:text-gray-400">Today: {energyKWh.toFixed(3)} kWh</p>}{recentAvgW !== null && Number.isFinite(recentAvgW) && <p className="text-xs text-gray-500 dark:text-gray-400">Avg (5s): {recentAvgW.toFixed(2)} W</p>}</div><motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleToggle}
    disabled={isLoading || device.status === "offline"}
    className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${device.isOn && device.status === "online" ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"} disabled:opacity-50 disabled:cursor-not-allowed`}
  ><Power className="h-4 w-4 mr-2" />{isLoading ? "Processing..." : device.isOn ? "Turn Off" : "Turn On"}</motion.button></div>{isOverLimit && <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"><div className="flex items-center"><AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" /><p className="text-sm text-red-700 dark:text-red-300">
              Safety limit exceeded! Device may auto-disconnect.
            </p></div></div>}</motion.div>;
};
export {
  DeviceCard
};
