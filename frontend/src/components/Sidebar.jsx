import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth.jsx';
import { FaTachometerAlt, FaChartPie, FaTabletAlt, FaWifi, FaInfoCircle, FaCog, FaBars } from 'react-icons/fa';

const SidebarLink = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 hover:bg-gray-200 ${
        isActive ? 'bg-gray-200 font-semibold' : ''
      }`
    }>
    <span className="text-lg">{icon}</span>
    <span className="whitespace-nowrap">{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`flex flex-col h-screen bg-white border-r transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Top header */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        {!collapsed && <h1 className="text-2xl font-bold">Sentry</h1>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-700 hover:text-gray-900">
          <FaBars size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-2">
        <SidebarLink to="/" icon={<FaTachometerAlt />} label="Dashboard" />
        <SidebarLink to="/charts" icon={<FaChartPie />} label="Charts" />
        <SidebarLink to="/devices" icon={<FaTabletAlt />} label="Devices" />
        <SidebarLink to="/wifi" icon={<FaWifi />} label="Wi‑Fi Setup" />
        <SidebarLink to="/more" icon={<FaInfoCircle />} label="More Details" />
        <SidebarLink to="/settings" icon={<FaCog />} label="Settings" />
      </nav>

      {/* Logout */}
      {user && (
        <div className="px-4 py-4 border-t">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-gray-900 text-white py-2 hover:bg-gray-800 transition-colors">
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
