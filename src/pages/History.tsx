import React, { useState } from 'react';
import { DownloadIcon, CalendarIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
const mockDailyData = [{
  date: 'Mon',
  consumption: 85.2,
  cost: 12.5
}, {
  date: 'Tue',
  consumption: 92.1,
  cost: 13.8
}, {
  date: 'Wed',
  consumption: 78.5,
  cost: 11.2
}, {
  date: 'Thu',
  consumption: 88.3,
  cost: 12.9
}, {
  date: 'Fri',
  consumption: 95.7,
  cost: 14.1
}, {
  date: 'Sat',
  consumption: 45.2,
  cost: 6.8
}, {
  date: 'Sun',
  consumption: 38.9,
  cost: 5.5
}];
const mockZoneData = [{
  zone: 'Industrial',
  consumption: 245.8
}, {
  zone: 'Workshop 1',
  consumption: 156.3
}, {
  zone: 'Workshop 2',
  consumption: 98.7
}];
export function History() {
  const [dateRange, setDateRange] = useState('week');
  return <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Energy History & Reports
        </h1>
        <p className="text-gray-600 mt-1">
          View historical energy consumption and generate reports
        </p>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Total Consumption</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">523.8 kWh</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingDownIcon className="w-4 h-4" />
            <span>12% vs last week</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Total Cost</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">$76.80</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingDownIcon className="w-4 h-4" />
            <span>8% vs last week</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Peak Usage</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">95.7 kW</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
            <TrendingUpIcon className="w-4 h-4" />
            <span>5% vs last week</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Avg. Daily</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">74.8 kWh</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingDownIcon className="w-4 h-4" />
            <span>3% vs last week</span>
          </div>
        </div>
      </div>
      {/* Date Range Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {['day', 'week', 'month', 'year'].map(range => <button key={range} onClick={() => setDateRange(range)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${dateRange === range ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>)}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <DownloadIcon className="w-5 h-5" />
          Export Report
        </button>
      </div>
      {/* Consumption Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Energy Consumption
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockDailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Line type="monotone" dataKey="consumption" stroke="#3b82f6" strokeWidth={2} name="Consumption (kWh)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Cost Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Energy Cost</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockDailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Bar dataKey="cost" fill="#10b981" name="Cost ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Zone Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Zone Breakdown</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockZoneData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" />
            <YAxis dataKey="zone" type="category" stroke="#6b7280" />
            <Tooltip />
            <Bar dataKey="consumption" fill="#6366f1" name="Consumption (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>;
}