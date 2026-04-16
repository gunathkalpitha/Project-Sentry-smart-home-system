import React, { useState } from 'react';
import { PlusIcon, ClockIcon, LinkIcon, TrashIcon } from 'lucide-react';
export function Scheduling() {
  const [schedules, setSchedules] = useState([{
    id: 1,
    device: 'Main Conveyor',
    action: 'Turn On',
    time: '08:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  }, {
    id: 2,
    device: 'Main Conveyor',
    action: 'Turn Off',
    time: '18:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  }]);
  const [chains, setChains] = useState([{
    id: 1,
    name: 'Morning Startup',
    time: '07:30',
    actions: [{
      device: 'Air Compressor',
      action: 'Turn On',
      delay: 0
    }, {
      device: 'Main Conveyor',
      action: 'Turn On',
      delay: 5
    }, {
      device: 'Packaging Unit',
      action: 'Turn On',
      delay: 10
    }]
  }]);
  return <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Scheduling & Chaining
        </h1>
        <p className="text-gray-600 mt-1">
          Automate device operations with schedules and action chains
        </p>
      </div>
      {/* Schedules Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Device Schedules
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Set specific times for devices to turn on or off
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusIcon className="w-5 h-5" />
            Add Schedule
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {schedules.map(schedule => <div key={schedule.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {schedule.device}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {schedule.action} at {schedule.time}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {schedule.days.map(day => <span key={day} className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-700 rounded">
                        {day}
                      </span>)}
                  </div>
                </div>
                <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>)}
          </div>
        </div>
      </div>
      {/* Chains Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Action Chains</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create sequences of device actions with delays
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <PlusIcon className="w-5 h-5" />
            Create Chain
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {chains.map(chain => <div key={chain.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {chain.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Starts at {chain.time}
                    </p>
                  </div>
                  <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {chain.actions.map((action, index) => <div key={index} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-semibold text-green-600">
                        {index + 1}
                      </div>
                      <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">
                          {action.device}
                        </p>
                        <p className="text-sm text-gray-600">{action.action}</p>
                      </div>
                      {action.delay > 0 && <div className="flex items-center gap-2 text-sm text-gray-600">
                          <LinkIcon className="w-4 h-4" />
                          <span>+{action.delay} min</span>
                        </div>}
                    </div>)}
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
}