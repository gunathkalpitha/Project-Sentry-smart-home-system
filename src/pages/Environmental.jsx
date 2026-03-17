import { useState } from "react";
import { Thermometer, Droplets, Wind, Flame, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
const mockReadings = [
  {
    id: "1",
    sensorId: "temp_001",
    temperature: 22.5,
    humidity: 45,
    airQuality: 85,
    co2Level: 420,
    timestamp: new Date(Date.now() - 60 * 60 * 1e3)
  },
  {
    id: "2",
    sensorId: "temp_001",
    temperature: 23.1,
    humidity: 47,
    airQuality: 82,
    co2Level: 435,
    timestamp: new Date(Date.now() - 50 * 60 * 1e3)
  },
  {
    id: "3",
    sensorId: "temp_001",
    temperature: 23.8,
    humidity: 48,
    airQuality: 78,
    co2Level: 450,
    timestamp: new Date(Date.now() - 40 * 60 * 1e3)
  },
  {
    id: "4",
    sensorId: "temp_001",
    temperature: 24.2,
    humidity: 50,
    airQuality: 75,
    co2Level: 465,
    timestamp: new Date(Date.now() - 30 * 60 * 1e3)
  }
];
const Environmental = () => {
  const [readings, setReadings] = useState(mockReadings);
  const [selectedMetric, setSelectedMetric] = useState("temperature");
  const currentReading = readings[readings.length - 1];
  const previousReading = readings[readings.length - 2];
  const getMetricChange = (current, previous) => {
    const change = (current - previous) / previous * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isIncrease: change > 0
    };
  };
  const getAirQualityStatus = (value) => {
    if (value >= 80) return { status: "Excellent", color: "text-green-600 dark:text-green-400" };
    if (value >= 60) return { status: "Good", color: "text-blue-600 dark:text-blue-400" };
    if (value >= 40) return { status: "Fair", color: "text-yellow-600 dark:text-yellow-400" };
    return { status: "Poor", color: "text-red-600 dark:text-red-400" };
  };
  const getCO2Status = (value) => {
    if (value <= 400) return { status: "Excellent", color: "text-green-600 dark:text-green-400" };
    if (value <= 600) return { status: "Good", color: "text-blue-600 dark:text-blue-400" };
    if (value <= 1e3) return { status: "Acceptable", color: "text-yellow-600 dark:text-yellow-400" };
    return { status: "Poor", color: "text-red-600 dark:text-red-400" };
  };
  const formatChartData = () => {
    return readings.map((reading) => ({
      time: reading.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      value: reading[selectedMetric] || 0
    }));
  };
  const getMetricUnit = (metric) => {
    switch (metric) {
      case "temperature":
        return "\xB0C";
      case "humidity":
        return "%";
      case "airQuality":
        return "/100";
      case "co2Level":
        return "ppm";
      default:
        return "";
    }
  };
  const getMetricColor = (metric) => {
    switch (metric) {
      case "temperature":
        return "#EF4444";
      case "humidity":
        return "#3B82F6";
      case "airQuality":
        return "#10B981";
      case "co2Level":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };
  return <div className="space-y-6">{
    /* Header */
  }<div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Environmental Monitoring</h1><p className="text-gray-600 dark:text-gray-400">Sentry environmental protection and air quality monitoring</p></div>{
    /* Current Readings */
  }<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  ><div className="flex items-center justify-between"><div className="flex items-center"><div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center"><Thermometer className="h-6 w-6 text-red-600 dark:text-red-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Temperature</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{currentReading?.temperature?.toFixed(1)}°C
                </p></div></div>{previousReading && <div className="flex items-center">{getMetricChange(currentReading.temperature, previousReading.temperature).isIncrease ? <TrendingUp className="h-4 w-4 text-red-500 mr-1" /> : <TrendingDown className="h-4 w-4 text-blue-500 mr-1" />}<span className="text-sm text-gray-600 dark:text-gray-400">{getMetricChange(currentReading.temperature, previousReading.temperature).value}%
                </span></div>}</div></motion.div><motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  ><div className="flex items-center justify-between"><div className="flex items-center"><div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Humidity</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{currentReading?.humidity}%
                </p></div></div>{previousReading && <div className="flex items-center">{getMetricChange(currentReading.humidity, previousReading.humidity).isIncrease ? <TrendingUp className="h-4 w-4 text-blue-500 mr-1" /> : <TrendingDown className="h-4 w-4 text-red-500 mr-1" />}<span className="text-sm text-gray-600 dark:text-gray-400">{getMetricChange(currentReading.humidity, previousReading.humidity).value}%
                </span></div>}</div></motion.div><motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  ><div className="flex items-center justify-between"><div className="flex items-center"><div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"><Wind className="h-6 w-6 text-green-600 dark:text-green-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Air Quality</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{currentReading?.airQuality}/100
                </p><p className={`text-xs font-medium ${getAirQualityStatus(currentReading?.airQuality || 0).color}`}>{getAirQualityStatus(currentReading?.airQuality || 0).status}</p></div></div></div></motion.div><motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  ><div className="flex items-center justify-between"><div className="flex items-center"><div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center"><Flame className="h-6 w-6 text-yellow-600 dark:text-yellow-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">CO2 Level</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{currentReading?.co2Level} ppm
                </p><p className={`text-xs font-medium ${getCO2Status(currentReading?.co2Level || 0).color}`}>{getCO2Status(currentReading?.co2Level || 0).status}</p></div></div></div></motion.div></div>{
    /* Environmental Chart */
  }<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Environmental Trends</h2><select
    value={selectedMetric}
    onChange={(e) => setSelectedMetric(e.target.value)}
    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
  ><option value="temperature">Temperature</option><option value="humidity">Humidity</option><option value="airQuality">Air Quality</option><option value="co2Level">CO2 Level</option></select></div><div className="h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={formatChartData()}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis
    dataKey="time"
    tick={{ fontSize: 12 }}
    className="text-gray-600 dark:text-gray-400"
  /><YAxis
    tick={{ fontSize: 12 }}
    className="text-gray-600 dark:text-gray-400"
    label={{
      value: getMetricUnit(selectedMetric),
      angle: -90,
      position: "insideLeft"
    }}
  /><Tooltip
    contentStyle={{
      backgroundColor: "var(--tooltip-bg)",
      border: "1px solid var(--tooltip-border)",
      borderRadius: "8px"
    }}
    formatter={(value) => [`${value}${getMetricUnit(selectedMetric)}`, selectedMetric]}
  /><Line
    type="monotone"
    dataKey="value"
    stroke={getMetricColor(selectedMetric)}
    strokeWidth={3}
    dot={{ r: 4 }}
    activeDot={{ r: 6 }}
  /></LineChart></ResponsiveContainer></div></div>{
    /* Environmental Alerts */
  }<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Environmental Status</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20"><div className="flex items-center"><Wind className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" /><div><p className="font-medium text-green-900 dark:text-green-100">Air Quality Good</p><p className="text-sm text-green-700 dark:text-green-300">All environmental parameters within normal range</p></div></div></div><div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20"><div className="flex items-center"><Thermometer className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" /><div><p className="font-medium text-blue-900 dark:text-blue-100">Temperature Optimal</p><p className="text-sm text-blue-700 dark:text-blue-300">Comfortable temperature range maintained</p></div></div></div></div></div></div>;
};
export {
  Environmental
};
