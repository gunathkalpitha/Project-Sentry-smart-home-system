import { useState } from "react";
import { X, Save, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const DeviceSettingsModal = ({
  device,
  isOpen,
  onClose,
  onSave
}) => {
  const [maxCurrent, setMaxCurrent] = useState(device?.maxCurrent || 10);
  const [maxVoltage, setMaxVoltage] = useState(device?.maxVoltage || 240);
  const [autoSafety, setAutoSafety] = useState(device?.autoSafety || true);
  const handleSave = () => {
    if (device) {
      onSave(device.id, { maxCurrent, maxVoltage });
      onClose();
    }
  };
  if (!device) return null;
  return <AnimatePresence>{isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"><motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.95, opacity: 0 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
  ><div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Device Settings
              </h2><button
    onClick={onClose}
    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
  ><X className="h-5 w-5" /></button></div><div className="space-y-4"><div><h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{device.name}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{device.room} • {device.type.charAt(0).toUpperCase() + device.type.slice(1)}</p></div><div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"><div className="flex items-center"><AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" /><p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Current readings: {device.currentReading.toFixed(2)}A / {device.voltageReading.toFixed(1)}V
                  </p></div></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Current (A)
                </label><input
    type="number"
    value={maxCurrent}
    onChange={(e) => setMaxCurrent(parseFloat(e.target.value))}
    step="0.1"
    min="0.1"
    max="50"
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
  /><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Device will automatically shut off when current exceeds this limit
                </p></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Voltage (V)
                </label><input
    type="number"
    value={maxVoltage}
    onChange={(e) => setMaxVoltage(parseFloat(e.target.value))}
    step="1"
    min="100"
    max="300"
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
  /><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Device will automatically shut off when voltage exceeds this limit
                </p></div><div className="flex items-center"><input
    type="checkbox"
    id="autoSafety"
    checked={autoSafety}
    onChange={(e) => setAutoSafety(e.target.checked)}
    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
  /><label htmlFor="autoSafety" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable automatic safety cutoff
                </label></div></div><div className="flex space-x-3 mt-6"><button
    onClick={onClose}
    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
  >
                Cancel
              </button><button
    onClick={handleSave}
    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center"
  ><Save className="h-4 w-4 mr-2" />
                Save Settings
              </button></div></motion.div></div>}</AnimatePresence>;
};
export {
  DeviceSettingsModal
};
