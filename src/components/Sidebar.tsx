import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboardIcon, SettingsIcon, ListOrderedIcon, ClockIcon, HistoryIcon, ZapIcon } from 'lucide-react';
export function Sidebar() {
  const location = useLocation();
  const navItems = [{
    path: '/',
    icon: LayoutDashboardIcon,
    label: 'Dashboard'
  }, {
    path: '/device-management',
    icon: SettingsIcon,
    label: 'Device Management'
  }, {
    path: '/priorities',
    icon: ListOrderedIcon,
    label: 'Priorities'
  }, {
    path: '/scheduling',
    icon: ClockIcon,
    label: 'Scheduling'
  }, {
    path: '/history',
    icon: HistoryIcon,
    label: 'History'
  }];
  return <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <ZapIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Sentry</h1>
            <p className="text-xs text-gray-400">Power Management</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return <li key={item.path}>
                <Link to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>;
        })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500">
          <p>System Status: Online</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>;
}