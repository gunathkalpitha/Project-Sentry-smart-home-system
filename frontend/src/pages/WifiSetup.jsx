import React, { useEffect, useState } from 'react';
import { FaWifi, FaLock, FaUnlock } from 'react-icons/fa';

export default function WifiSetup() {
  const [networks, setNetworks] = useState([]);
  const [currentNetwork, setCurrentNetwork] = useState('');
  const [selected, setSelected] = useState('');
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate network scan
    const mockNetworks = [
      { ssid: 'HomeWiFi', rssi: -45, secured: true },
      { ssid: 'GuestWiFi', rssi: -60, secured: false },
      { ssid: 'CafeWiFi', rssi: -70, secured: true },
      { ssid: 'PublicWiFi', rssi: -80, secured: false },
    ];

    setTimeout(() => {
      setNetworks(mockNetworks);
      setCurrentNetwork('HomeWiFi'); // Mock current connected network
      setLoading(false);
    }, 1000); // simulate 1 second scan delay
  }, []);

  const handleConnect = (e) => {
    e.preventDefault();
    setStatus(`Attempting to connect to "${ssid}"...`);
    setTimeout(() => {
      setCurrentNetwork(ssid);
      setStatus(`Connected to "${ssid}"!`);
      setSelected('');
      setPassword('');
    }, 1500); // simulate connection delay
  };

  const signalStrengthIcon = (rssi) => {
    if (rssi >= -50) return '📶📶📶📶';
    if (rssi >= -60) return '📶📶📶';
    if (rssi >= -70) return '📶📶';
    return '📶';
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FaWifi /> Wi‑Fi Setup
      </h2>

      {loading && <div className="text-gray-500">Scanning for networks...</div>}

      {/* Current Network */}
      {currentNetwork && !loading && (
        <div className="mb-4 p-3 rounded-xl bg-green-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaWifi />
            <strong>{currentNetwork}</strong>
          </div>
          <span className="text-green-700 font-semibold">Connected</span>
        </div>
      )}

      {/* Available Networks */}
      {!loading && networks.length > 0 && (
        <div className="space-y-2">
          {networks.map((net) => (
            <div
              key={net.ssid}
              className={`flex justify-between items-center p-3 rounded-xl cursor-pointer border ${
                selected === net.ssid
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => {
                setSelected(net.ssid);
                setSsid(net.ssid);
              }}
            >
              <div className="flex items-center gap-2">
                <FaWifi />
                <span>{net.ssid}</span>
                {net.secured ? <FaLock className="text-gray-700" /> : <FaUnlock className="text-gray-700" />}
              </div>
              <span>{signalStrengthIcon(net.rssi)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Connect Form */}
      {selected && (
        <form onSubmit={handleConnect} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">SSID</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Wi-Fi password"
              required={networks.find((n) => n.ssid === selected)?.secured}
            />
          </div>
          <button className="w-full rounded-xl bg-gray-900 text-white py-2">Connect</button>
        </form>
      )}

      {status && <div className="mt-3 text-sm text-blue-600">{status}</div>}
    </div>
  );
}
