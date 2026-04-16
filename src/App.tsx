import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DeviceManagement } from './pages/DeviceManagement';
import { Priorities } from './pages/Priorities';
import { Scheduling } from './pages/Scheduling';
import { History } from './pages/History';
export function App() {
  return <BrowserRouter>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/device-management" element={<DeviceManagement />} />
            <Route path="/priorities" element={<Priorities />} />
            <Route path="/scheduling" element={<Scheduling />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>;
}