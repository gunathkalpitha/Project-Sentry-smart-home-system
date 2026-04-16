import React, { useState } from 'react';
import { GripVerticalIcon, AlertTriangleIcon } from 'lucide-react';
export function Priorities() {
  const [zones, setZones] = useState([{
    id: 1,
    name: 'Industrial',
    priority: 1,
    devices: 3
  }, {
    id: 2,
    name: 'Workshop 1',
    priority: 2,
    devices: 2
  }, {
    id: 3,
    name: 'Workshop 2',
    priority: 3,
    devices: 2
  }]);
  return <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Priority Management
        </h1>
        <p className="text-gray-600 mt-1">
          Set zone priorities for automatic power management
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start gap-3">
        <AlertTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">How Priority Works</p>
          <p>
            During power overload, zones with lower priority will be
            automatically shut down first. The highest priority zone (Priority
            1) will remain active until power consumption returns to safe
            levels.
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Zone Priorities</h2>
          <p className="text-sm text-gray-600 mt-1">
            Drag to reorder priorities (1 = highest)
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {zones.map((zone, index) => <div key={zone.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <GripVerticalIcon className="w-5 h-5 text-gray-400 cursor-move" />
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <span className="text-xl font-bold text-blue-600">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                  <p className="text-sm text-gray-600">
                    {zone.devices} devices
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Priority {zone.priority}
                  </p>
                  <p className="text-xs text-gray-600">
                    {index === 0 ? 'Highest' : index === zones.length - 1 ? 'Lowest' : 'Medium'}
                  </p>
                </div>
              </div>)}
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Power Overload Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Safe Power Limit (kW)
            </label>
            <input type="number" defaultValue={100} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warning Threshold (%)
            </label>
            <input type="number" defaultValue={85} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Save Settings
        </button>
      </div>
    </div>;
}