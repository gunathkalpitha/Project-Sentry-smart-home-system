import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ZapIcon, ActivityIcon, PowerIcon, PlusIcon, ListOrderedIcon, SearchIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const mockPowerData = [{
  time: '00:00',
  power: 45
}, {
  time: '04:00',
  power: 38
}, {
  time: '08:00',
  power: 72
}, {
  time: '12:00',
  power: 85
}, {
  time: '16:00',
  power: 78
}, {
  time: '20:00',
  power: 62
}];
const mockZones = [{
  id: 1,
  name: 'Industrial',
  devices: [{
    id: 1,
    name: 'Main Conveyor',
    status: true,
    power: 15.2
  }, {
    id: 2,
    name: 'Packaging Unit',
    status: true,
    power: 8.5
  }, {
    id: 3,
    name: 'Air Compressor',
    status: false,
    power: 0
  }]
}, {
  id: 2,
  name: 'Workshop 1',
  devices: [{
    id: 4,
    name: 'CNC Machine',
    status: true,
    power: 22.3
  }, {
    id: 5,
    name: 'Welding Station',
    status: false,
    power: 0
  }]
}, {
  id: 3,
  name: 'Workshop 2',
  devices: [{
    id: 6,
    name: 'Drill Press',
    status: true,
    power: 5.8
  }, {
    id: 7,
    name: 'Lathe Machine',
    status: true,
    power: 12.1
  }]
}];
export function Dashboard() {
  const [devices, setDevices] = useState(mockZones.flatMap(zone => zone.devices.map(device => ({
    ...device,
    zone: zone.name
  }))));
  const [searchTerm, setSearchTerm] = useState('');
  const totalPower = devices.reduce((sum, device) => sum + device.power, 0);
  const toggleDevice = (deviceId: number) => {
    setDevices(devices.map(device => device.id === deviceId ? {
      ...device,
      status: !device.status
    } : device));
  };
  const filteredDevices = devices.filter(device => device.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const getZoneStatus = (zoneName: string) => {
    return devices.some(d => d.zone === zoneName && d.status);
  };
  return <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Power Management Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Monitor and control your facility's power consumption
        </p>
      </div>
      {/* Overall Power Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Power</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {totalPower.toFixed(1)} kW
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ZapIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">142.5 A</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ActivityIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Voltage</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">230 V</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <PowerIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      {/* Zones */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Zones</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockZones.map(zone => <div key={zone.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {zone.name}
              </h3>
              <div className="space-y-3">
                {zone.devices.map(device => <div key={device.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${device.status ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm text-gray-700">
                        {device.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {device.power} kW
                    </span>
                  </div>)}
              </div>
            </div>)}
        </div>
      </div>
      {/* Graph */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Power Consumption (24h)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockPowerData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Line type="monotone" dataKey="power" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Control Panel</h2>
          <div className="relative">
            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search devices..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map(device => <div key={device.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{device.name}</p>
                <p className="text-sm text-gray-500">{device.zone}</p>
              </div>
              <button onClick={() => toggleDevice(device.id)} className={`relative w-12 h-6 rounded-full transition-colors ${device.status ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${device.status ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>)}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <Link to="/priorities" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <ListOrderedIcon className="w-5 h-5" />
          Priorities
        </Link>
        <Link to="/device-management" className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <PlusIcon className="w-5 h-5" />
          Add Device
        </Link>
      </div>
      {/* Zone Status */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Zone Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockZones.map(zone => {
          const isActive = getZoneStatus(zone.name);
          return <div key={zone.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <span className="font-medium text-gray-900">{zone.name}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-600">
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>;
        })}
        </div>
      </div>
    </div>;
}