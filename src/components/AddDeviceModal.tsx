import React, { useState, Fragment } from 'react';
import { XIcon, ChevronRightIcon, ChevronLeftIcon } from 'lucide-react';
interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  existingZones: string[];
}
export function AddDeviceModal({
  isOpen,
  onClose,
  onSubmit,
  existingZones
}: AddDeviceModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    zone: '',
    newZone: '',
    deviceType: '',
    deviceName: '',
    esp32: '',
    sockets: 1,
    isDedicated: false,
    voltage: 230,
    power: 0
  });
  if (!isOpen) return null;
  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };
  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
    setStep(1);
    setFormData({
      zone: '',
      newZone: '',
      deviceType: '',
      deviceName: '',
      esp32: '',
      sockets: 1,
      isDedicated: false,
      voltage: 230,
      power: 0
    });
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add New Device</h2>
          <button onClick={onClose} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map(s => <Fragment key={s}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-16 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </Fragment>)}
          </div>
          {/* Step 1: Select Zone and Device Type */}
          {step === 1 && <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Zone
                </label>
                <select value={formData.zone} onChange={e => setFormData({
              ...formData,
              zone: e.target.value
            })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select existing zone</option>
                  {existingZones.map(zone => <option key={zone} value={zone}>
                      {zone}
                    </option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Create New Zone
                </label>
                <input type="text" value={formData.newZone} onChange={e => setFormData({
              ...formData,
              newZone: e.target.value
            })} placeholder="Enter new zone name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setFormData({
                ...formData,
                deviceType: 'switch'
              })} className={`p-4 border-2 rounded-lg font-medium transition-colors ${formData.deviceType === 'switch' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}>
                    Switch
                  </button>
                  <button onClick={() => setFormData({
                ...formData,
                deviceType: 'outlet'
              })} className={`p-4 border-2 rounded-lg font-medium transition-colors ${formData.deviceType === 'outlet' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}>
                    Outlet
                  </button>
                </div>
              </div>
            </div>}
          {/* Step 2: Device Name */}
          {step === 2 && <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Name
                </label>
                <input type="text" value={formData.deviceName} onChange={e => setFormData({
              ...formData,
              deviceName: e.target.value
            })} placeholder="Enter device name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-sm text-gray-500 mt-2">
                  This name can be changed anytime
                </p>
              </div>
            </div>}
          {/* Step 3: ESP32 and Configuration */}
          {step === 3 && <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select ESP32 Device
                </label>
                <select value={formData.esp32} onChange={e => setFormData({
              ...formData,
              esp32: e.target.value
            })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Searching for devices...</option>
                  <option value="esp32-001">ESP32-001 (192.168.1.10)</option>
                  <option value="esp32-002">ESP32-002 (192.168.1.11)</option>
                  <option value="esp32-003">ESP32-003 (192.168.1.12)</option>
                </select>
              </div>
              {formData.deviceType === 'outlet' && <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Sockets
                  </label>
                  <input type="number" min="1" max="8" value={formData.sockets} onChange={e => setFormData({
              ...formData,
              sockets: parseInt(e.target.value)
            })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>}
              {formData.deviceType === 'switch' && <>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="dedicated" checked={formData.isDedicated} onChange={e => setFormData({
                ...formData,
                isDedicated: e.target.checked
              })} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                    <label htmlFor="dedicated" className="text-sm font-medium text-gray-700">
                      Use for dedicated device
                    </label>
                  </div>
                  {formData.isDedicated && <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Voltage (V)
                        </label>
                        <input type="number" value={formData.voltage} onChange={e => setFormData({
                  ...formData,
                  voltage: parseFloat(e.target.value)
                })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Power (kW)
                        </label>
                        <input type="number" step="0.1" value={formData.power} onChange={e => setFormData({
                  ...formData,
                  power: parseFloat(e.target.value)
                })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>}
                </>}
            </div>}
        </div>
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button onClick={handleBack} disabled={step === 1} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronLeftIcon className="w-5 h-5" />
            Back
          </button>
          {step < 3 ? <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Next
              <ChevronRightIcon className="w-5 h-5" />
            </button> : <button onClick={handleSubmit} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Add Device
            </button>}
        </div>
      </div>
    </div>;
}