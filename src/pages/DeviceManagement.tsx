import React, { useState } from 'react';
import { PlusIcon, TrashIcon, EditIcon } from 'lucide-react';
import { AddDeviceModal } from '../components/AddDeviceModal';
export function DeviceManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zones, setZones] = useState([{
    id: 1,
    name: 'Industrial',
    devices: [{
      id: 1,
      name: 'Main Conveyor',
      type: 'switch',
      sockets: 0,
      voltage: 230,
      power: 15.2
    }, {
      id: 2,
      name: 'Packaging Unit',
      type: 'outlet',
      sockets: 4,
      voltage: 230,
      power: 8.5
    }]
  }, {
    id: 2,
    name: 'Workshop 1',
    devices: [{
      id: 3,
      name: 'CNC Machine',
      type: 'switch',
      sockets: 0,
      voltage: 230,
      power: 22.3
    }]
  }]);
  const handleAddDevice = (deviceData: any) => {
    console.log('Device added:', deviceData);
    // Add device logic here
  };
  return <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Device Management
          </h1>
          <p className="text-gray-600 mt-1">Manage zones and devices</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusIcon className="w-5 h-5" />
          Add Device
        </button>
      </div>
      <div className="space-y-6">
        {zones.map(zone => <div key={zone.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{zone.name}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {zone.devices.length} devices
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zone.devices.map(device => <div key={device.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {device.name}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {device.type}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {device.type === 'outlet' && <div className="flex justify-between">
                          <span className="text-gray-600">Sockets:</span>
                          <span className="font-medium text-gray-900">
                            {device.sockets}
                          </span>
                        </div>}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Voltage:</span>
                        <span className="font-medium text-gray-900">
                          {device.voltage}V
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Power:</span>
                        <span className="font-medium text-gray-900">
                          {device.power}kW
                        </span>
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>
          </div>)}
      </div>
      <AddDeviceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddDevice} existingZones={zones.map(z => z.name)} />
    </div>;
}