import { useState, useEffect } from "react";
import { Wifi, WifiOff, Search, Lock, Unlock, RefreshCw, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AddDeviceModal } from "../components/Modals/AddDeviceModal";
import { useDevices } from "../hooks/useDevices";
import { wifiApi } from "../services/api";
import { socketService } from "../services/socket";
import toast from "react-hot-toast";
const WiFi = () => {
  const [networks, setNetworks] = useState([]);
  const [currentNetwork, setCurrentNetwork] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [realDevices, setRealDevices] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefillEspId, setPrefillEspId] = useState(null);
  const { addDevice, devices } = useDevices();
  const scanNetworks = async () => {
    setIsScanning(true);
    try {
      const response = await wifiApi.scan();
      if (Array.isArray(response.networks) && response.networks.length > 0) {
        const mappedNetworks = response.networks.map((n) => ({
          ...n,
          signal: n.signal_level !== void 0 ? Math.max(0, Math.min(100, Math.round(2 * (n.signal_level + 100)))) : 0,
          security: n.security || (n.security_flags === "none" ? "Open" : "Secured")
        }));
        setNetworks(mappedNetworks);
        toast.success("Network scan completed");
      } else {
        setNetworks([]);
        toast.error("No WiFi networks found");
      }
    } catch (error) {
      setNetworks([]);
      toast.error("Failed to scan networks");
    } finally {
      setIsScanning(false);
    }
  };
  const getCurrentNetwork = async () => {
    try {
      const response = await wifiApi.status();
      const ssid = response.ssid || response.current && response.current[0] && response.current[0].ssid || "";
      return ssid || "";
    } catch (error) {
      return "";
    }
  };
  const fetchConnectedDevices = async (ssid) => {
    if (!ssid) return setRealDevices([]);
    try {
      const res = await wifiApi.getConnectedDevices(ssid);
      setRealDevices(res.devices || []);
    } catch (err) {
      console.error("Failed to fetch connected devices", err);
      setRealDevices([]);
    }
  };
  const handleNetworkSelect = (network) => {
    setSelectedNetwork(network);
    setPassword("");
    if (network.security === "Open") {
      connectToNetwork(network.ssid, "");
    } else {
      setShowPasswordModal(true);
    }
  };
  const connectToNetwork = async (ssid, networkPassword) => {
    setIsConnecting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to connect the network. Please log in and try again.");
        setIsConnecting(false);
        return;
      }
      await wifiApi.connect(ssid, networkPassword);
      setCurrentNetwork(ssid);
      setShowPasswordModal(false);
      toast.success(`Connected to ${ssid}`);
    } catch (error) {
      console.error("Connect to network failed", error);
      const message = error && error.message ? error.message : "Failed to connect to network";
      toast.error(message);
    } finally {
      setIsConnecting(false);
    }
  };
  const getSignalStrength = (signal) => {
    if (signal >= 70) return { bars: 4, color: "text-green-500" };
    if (signal >= 50) return { bars: 3, color: "text-yellow-500" };
    if (signal >= 30) return { bars: 2, color: "text-orange-500" };
    return { bars: 1, color: "text-red-500" };
  };
  const SignalBars = ({ signal }) => {
    const { bars, color } = getSignalStrength(signal);
    return <div className="flex items-end space-x-1">{[1, 2, 3, 4].map((bar) => <div
      key={bar}
      className={`w-1 bg-gray-300 dark:bg-gray-600 ${bar <= bars ? color : ""}`}
      style={{ height: `${bar * 3 + 2}px` }}
    />)}</div>;
  };
  useEffect(() => {
    scanNetworks();
    const handleWifiConnected = (deviceIds) => {
      setConnectedDevices(deviceIds || []);
      console.debug("wifi-connected", deviceIds);
    };
    const handleEspDiscovered = (data) => {
      const espId = data.espId || data.id || data.esp || "";
      if (!espId) return;
      toast("ESP32 discovered: " + espId);
      setRealDevices((prev) => {
        if (prev.find((d) => d.espId === espId)) return prev;
        return [...prev, {
          espId,
          current: data.current || 0,
          voltage: data.voltage || 0,
          registered: !!data.registered,
          wifiNetwork: data.wifiNetwork || null
        }];
      });
    };
    socketService.on("wifi-connected", handleWifiConnected);
    socketService.on("esp32-discovered", handleEspDiscovered);
    return () => {
      socketService.off("wifi-connected", handleWifiConnected);
      socketService.off("esp32-discovered", handleEspDiscovered);
    };
  }, []);
  useEffect(() => {
    const espSSIDCounts = {};
    devices.forEach((d) => {
      if (d.wifiNetwork && d.status === "online") {
        espSSIDCounts[d.wifiNetwork] = (espSSIDCounts[d.wifiNetwork] || 0) + 1;
      }
    });
    const ssids = Object.keys(espSSIDCounts);
    if (ssids.length > 0) {
      const best = ssids.sort((a, b) => espSSIDCounts[b] - espSSIDCounts[a])[0];
      setCurrentNetwork(best);
      return;
    }
    (async () => {
      try {
        const creds = await wifiApi.credentials();
        if (creds && creds.ssid) {
          setCurrentNetwork(creds.ssid);
          return;
        }
      } catch (err) {
      }
      const serverSsid = await getCurrentNetwork();
      setCurrentNetwork(serverSsid || "Not connected");
    })();
  }, [devices]);
  useEffect(() => {
    if (currentNetwork && currentNetwork !== "Not connected") {
      fetchConnectedDevices(currentNetwork);
    } else {
      setRealDevices([]);
    }
  }, [currentNetwork]);
  return <div className="space-y-6">{
    /* Header */
  }<div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">WiFi Settings</h1><p className="text-gray-600 dark:text-gray-400">Manage network connections for your Sentry security devices</p></div><motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={scanNetworks}
    disabled={isScanning}
    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
  ><RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? "animate-spin" : ""}`} />{isScanning ? "Scanning..." : "Scan Networks"}</motion.button></div>{
    /* Current Network Status */
  }<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center justify-between"><div className="flex items-center"><div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"><Wifi className="h-6 w-6 text-green-600 dark:text-green-400" /></div><div className="ml-4"><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Network</h3><p className="text-gray-600 dark:text-gray-400">{currentNetwork}</p></div></div><div className="text-right"><p className="text-sm text-gray-500 dark:text-gray-400">Status</p><p className="text-green-600 dark:text-green-400 font-medium">Connected</p></div></div></div>{
    /* ESP32 Device Status */
  }<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ESP32 Device Network Status</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{realDevices.length > 0 ? realDevices.map((d) => <div key={d.espId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><div className="flex items-center"><div className={`w-3 h-3 rounded-full mr-3 ${connectedDevices.includes(d.espId) ? "bg-green-500" : "bg-gray-400"}`} /><span className="text-sm font-medium text-gray-900 dark:text-white">{d.espId}</span></div><div className="flex items-center space-x-2">{connectedDevices.includes(d.espId) && <Check className="h-4 w-4 text-green-500" />}<button
    onClick={() => {
      setPrefillEspId(d.espId);
      setIsAddModalOpen(true);
    }}
    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
  >
                    Claim
                  </button></div></div>) : (
    // fallback placeholder
    <div className="col-span-full text-gray-500">No ESP devices discovered yet</div>
  )}</div></div>{
    /* Add Device Modal (Claim) */
  }<AddDeviceModal
    isOpen={isAddModalOpen}
    onClose={() => {
      setIsAddModalOpen(false);
      setPrefillEspId(null);
    }}
    onSave={(deviceData) => {
      const payload = prefillEspId ? { ...deviceData, espId: prefillEspId } : deviceData;
      addDevice(payload);
      setIsAddModalOpen(false);
      setPrefillEspId(null);
    }}
  />{
    /* Available Networks */
  }<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Networks</h3><div className="flex items-center text-sm text-gray-500 dark:text-gray-400"><Search className="h-4 w-4 mr-1" />{networks.length} networks found
          </div></div><div className="space-y-2">{networks.map((network, index) => <motion.div
    key={network.ssid}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    onClick={() => handleNetworkSelect(network)}
    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
  ><div className="flex items-center"><div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">{network.security === "Open" ? <Unlock className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />}</div><div><h4 className="font-medium text-gray-900 dark:text-white">{network.ssid}</h4><p className="text-sm text-gray-500 dark:text-gray-400">{network.security}</p></div></div><div className="flex items-center space-x-3"><span className="text-sm text-gray-500 dark:text-gray-400">{network.signal}%</span><SignalBars signal={network.signal} /></div></motion.div>)}</div>{networks.length === 0 && !isScanning && <div className="text-center py-8"><WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-500 dark:text-gray-400">No networks found. Try scanning again.</p></div>}</div>{
    /* Password Modal */
  }<AnimatePresence>{showPasswordModal && selectedNetwork && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"><motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.95, opacity: 0 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
  ><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Connect to {selectedNetwork.ssid}</h3><button
    onClick={() => setShowPasswordModal(false)}
    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
  >
                  ×
                </button></div><div className="mb-4"><div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"><AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" /><p className="text-sm text-blue-700 dark:text-blue-300">
                    This password will be sent to all ESP32 devices to connect them to the network.
                  </p></div></div><div className="mb-6"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Network Password
                </label><input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter network password"
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
    autoFocus
  /></div><div className="flex space-x-3"><button
    onClick={() => setShowPasswordModal(false)}
    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
  >
                  Cancel
                </button><button
    onClick={() => connectToNetwork(selectedNetwork.ssid, password)}
    disabled={isConnecting || !password && selectedNetwork.security !== "Open"}
    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
  >{isConnecting ? "Connecting..." : "Connect"}</button></div></motion.div></div>}</AnimatePresence></div>;
};
export {
  WiFi
};
