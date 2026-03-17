import { useState, useEffect } from "react";
import { X, Save, Zap, Wifi, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { socketService } from "../../services/socket";
const AddDeviceModal = ({
  isOpen,
  onClose,
  onSave,
  initialEspId = null,
  initialStep = 1
}) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "outlet",
    room: "",
    espId: "",
    socketIndex: 1,
    maxCurrent: 15,
    maxVoltage: 250,
    autoSafety: true
  });
  const [step, setStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [availableESPs, setAvailableESPs] = useState([]);
  const rooms = ["Living Room", "Kitchen", "Bedroom", "Bathroom", "Office", "Garage", "Basement"];
  const deviceTypes = [
    { value: "outlet", label: "Smart Outlet", icon: "\u{1F50C}" },
    { value: "switch", label: "Smart Switch", icon: "\u{1F4A1}" }
  ];
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleScanESPs = async () => {
    setIsScanning(true);
    try {
      toast("Scanning for ESP32 devices...");
      setTimeout(() => {
        setIsScanning(false);
        toast.success("Scan complete");
      }, 1500);
    } catch (err) {
      setIsScanning(false);
      toast.error("Failed to scan ESP32 devices");
    }
  };
  useEffect(() => {
    const onDiscovered = (data) => {
      const espId = data.espId || data.id || data.esp || "";
      if (!espId) return;
      setAvailableESPs((prev) => {
        if (prev.find((e) => e.id === espId)) return prev;
        return [...prev, {
          id: espId,
          name: data.name || espId,
          signal: data.signal || 75,
          piName: data.piName || data.pi || "Unknown",
          registered: !!data.registered,
          wifiNetwork: data.wifiNetwork || null
        }];
      });
    };
    socketService.on("esp32-discovered", onDiscovered);
    return () => {
      socketService.off("esp32-discovered", onDiscovered);
    };
  }, []);
  const handleSave = () => {
    if (!formData.name || !formData.room || !formData.espId) {
      toast.error("Please fill in all required fields");
      return;
    }
    const deviceData = {
      ...formData,
      signalStrength: availableESPs.find((esp) => esp.id === formData.espId)?.signal || 75
    };
    if (process.env.NODE_ENV === "development") {
      console.log("[add-device] payload", deviceData);
    }
    onSave(deviceData);
    onClose();
    setFormData({
      name: "",
      type: "outlet",
      room: "",
      espId: "",
      socketIndex: 1,
      maxCurrent: 15,
      maxVoltage: 250,
      autoSafety: true
    });
    setStep(1);
  };
  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.type || !formData.room)) {
      toast.error("Please fill in all device information");
      return;
    }
    setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);
  useEffect(() => {
    if (isOpen && initialEspId) {
      setFormData((prev) => ({ ...prev, espId: initialEspId || "" }));
      setStep(initialStep || 2);
    }
    if (!isOpen) {
      setFormData({
        name: "",
        type: "outlet",
        room: "",
        espId: "",
        socketIndex: 1,
        maxCurrent: 15,
        maxVoltage: 250,
        autoSafety: true
      });
      setAvailableESPs([]);
      setIsScanning(false);
      setStep(1);
    }
  }, [isOpen, initialEspId, initialStep]);
  return <AnimatePresence>{isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"><motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.95, opacity: 0 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6"
  ><div className="flex items-center justify-between mb-6"><h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add New Device
              </h2><button
    onClick={onClose}
    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
  ><X className="h-5 w-5" /></button></div>{
    /* Progress Steps */
  }<div className="flex items-center justify-center mb-6"><div className="flex items-center space-x-4"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                  1
                </div><div className={`w-16 h-1 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`} /><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                  2
                </div><div className={`w-16 h-1 ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`} /><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                  3
                </div></div></div>{
    /* initialize prefilled espId / step when modal opens */
  }{
    /* useEffect below handles initialization when isOpen changes */
  }{
    /* Step 1: Device Information */
  }{step === 1 && <div className="space-y-4"><h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Device Information</h3><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Device Name *
                  </label><input
    type="text"
    value={formData.name}
    onChange={(e) => handleInputChange("name", e.target.value)}
    placeholder="e.g., Living Room Outlet"
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
  /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Device Type *
                  </label><div className="grid grid-cols-2 gap-3">{deviceTypes.map((type) => <button
    key={type.value}
    onClick={() => handleInputChange("type", type.value)}
    className={`p-4 border rounded-lg text-left transition-colors ${formData.type === type.value ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
  ><div className="text-2xl mb-2">{type.icon}</div><div className="font-medium text-gray-900 dark:text-white">{type.label}</div></button>)}</div></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room *
                  </label><select
    value={formData.room}
    onChange={(e) => handleInputChange("room", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
  ><option value="">Select a room</option>{rooms.map((room) => <option key={room} value={room}>{room}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Socket / Relay # *
                  </label><div className="flex space-x-3">{[1, 2].map((idx) => <button
    key={idx}
    onClick={() => handleInputChange("socketIndex", idx)}
    type="button"
    className={`px-3 py-2 border rounded-lg ${formData.socketIndex === idx ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"}`}
  >
                        Relay {idx}</button>)}</div></div></div>}{
    /* Step 2: ESP32 Selection */
  }{step === 2 && <div className="space-y-4"><div className="flex items-center justify-between"><h3 className="text-lg font-medium text-gray-900 dark:text-white">Select ESP32 Device</h3><button
    onClick={handleScanESPs}
    disabled={isScanning}
    className="flex items-center px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
  ><Wifi className={`h-4 w-4 mr-2 ${isScanning ? "animate-spin" : ""}`} />{isScanning ? "Scanning..." : "Scan"}</button></div><div className="space-y-2">{availableESPs.map((esp) => <button
    key={esp.id}
    onClick={() => handleInputChange("espId", esp.id)}
    className={`w-full p-4 border rounded-lg text-left transition-colors ${formData.espId === esp.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
  ><div className="flex items-center justify-between"><div className="flex items-center"><Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" /><div><p className="font-medium text-gray-900 dark:text-white">{esp.name}</p><p className="text-sm text-gray-500 dark:text-gray-400">{esp.piName} • Signal: {esp.signal}%
                            </p></div></div><div className="flex items-center space-x-1">{[1, 2, 3, 4].map((bar) => <div
    key={bar}
    className={`w-1 bg-gray-300 dark:bg-gray-600 ${bar <= Math.floor(esp.signal / 25) ? "bg-green-500" : ""}`}
    style={{ height: `${bar * 3 + 2}px` }}
  />)}</div></div></button>)}</div>{availableESPs.length === 0 && <div className="text-center py-8"><AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-500 dark:text-gray-400">No ESP32 devices found. Make sure they are powered on and in pairing mode.</p></div>}</div>}{
    /* Step 3: Safety Settings */
  }{step === 3 && <div className="space-y-4"><h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Safety Settings</h3><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Current (A)
                  </label><input
    type="number"
    value={formData.maxCurrent}
    onChange={(e) => handleInputChange("maxCurrent", parseFloat(e.target.value))}
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
    value={formData.maxVoltage}
    onChange={(e) => handleInputChange("maxVoltage", parseFloat(e.target.value))}
    step="1"
    min="100"
    max="300"
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
  /><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Device will automatically shut off when voltage exceeds this limit
                  </p></div><div className="flex items-center"><input
    type="checkbox"
    id="autoSafety"
    checked={formData.autoSafety}
    onChange={(e) => handleInputChange("autoSafety", e.target.checked)}
    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
  /><label htmlFor="autoSafety" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable automatic safety cutoff
                  </label></div><div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"><div className="flex items-center"><AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" /><p className="text-sm text-blue-700 dark:text-blue-300">
                      Sentry will continuously monitor this device for safety violations and automatically protect your home.
                    </p></div></div></div>}{
    /* Navigation Buttons */
  }<div className="flex justify-between mt-6"><button
    onClick={step === 1 ? onClose : prevStep}
    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
  >{step === 1 ? "Cancel" : "Back"}</button>{step < 3 ? <button
    onClick={nextStep}
    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
  >
                  Next
                </button> : <button
    onClick={handleSave}
    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
  ><Save className="h-4 w-4 mr-2" />
                  Add Device
                </button>}</div></motion.div></div>}</AnimatePresence>;
};
export {
  AddDeviceModal
};
