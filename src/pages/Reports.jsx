import React, { useState, useEffect } from "react";
import { Download, FileText, TrendingUp, Zap, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import toast from "react-hot-toast";
import { reportApi } from "../services/api";
const mockEnergyData = [
  { name: "Week 1", consumption: 45.2, cost: 6.78 },
  { name: "Week 2", consumption: 52.1, cost: 7.82 },
  { name: "Week 3", consumption: 48.7, cost: 7.31 },
  { name: "Week 4", consumption: 51.3, cost: 7.7 }
];
const mockDeviceData = [
  { name: "Living Room Outlet", consumption: 89.5, percentage: 35, color: "#3B82F6" },
  { name: "Kitchen Appliances", consumption: 67.2, percentage: 26, color: "#10B981" },
  { name: "Bedroom Devices", consumption: 45.8, percentage: 18, color: "#F59E0B" },
  { name: "Office Equipment", consumption: 32.1, percentage: 13, color: "#EF4444" },
  { name: "Other Devices", consumption: 20.4, percentage: 8, color: "#8B5CF6" }
];
const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [reportType, setReportType] = useState("energy");
  const [costPerKwh, setCostPerKwh] = useState(() => {
    try {
      const v = localStorage.getItem("sentry:costPerKwh");
      return v ? Number(v) : 0.15;
    } catch (e) {
      return 0.15;
    }
  });
  const handleDownloadReport = async (format) => {
    toast.loading("Generating report...");
    try {
      const resp = await reportApi.downloadReport(selectedPeriod, format);
      const contentType = resp.headers && resp.headers["content-type"];
      if (contentType && contentType.includes("application/json")) {
        toast.success("Report generated (JSON)");
        toast.dismiss();
        return;
      }
      const blob = new Blob([resp.data], { type: resp.headers["content-type"] || "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sentry-report-${selectedPeriod}.${format === "csv" ? "csv" : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("Report downloaded");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to download report");
    }
  };
  const [reportData, setReportData] = React.useState(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await reportApi.getEnergyReport(selectedPeriod);
        if (!mounted) return;
        setReportData(resp.data);
      } catch (err) {
        toast.error("Failed to load report");
      } finally {
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedPeriod]);
  const totalConsumption = reportData ? reportData.totalKWh : 0;
  const totalCost = totalConsumption * costPerKwh;
  const avgDaily = totalConsumption / (selectedPeriod === "month" ? 30 : selectedPeriod === "week" ? 7 : 365);
  return <div className="space-y-6">{
    /* Header */
  }<div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1><p className="text-gray-600 dark:text-gray-400">Comprehensive Sentry system reports and analytics</p></div><div className="flex items-center space-x-3"><select
    value={reportType}
    onChange={(e) => setReportType(e.target.value)}
    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  ><option value="energy">Energy Report</option><option value="security">Security Report</option><option value="environmental">Environmental Report</option></select><div className="flex items-center space-x-2"><label className="text-sm text-gray-600 dark:text-gray-400">Cost (CEB):</label><input
    type="number"
    step="0.01"
    value={Number(costPerKwh)}
    onChange={(e) => {
      const v = Number(e.target.value);
      setCostPerKwh(v);
      try {
        localStorage.setItem("sentry:costPerKwh", String(v));
      } catch (err) {
      }
    }}
    className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  /><a href="https://www.ceb.lk/" target="_blank" rel="noreferrer" className="text-sm text-blue-600 dark:text-blue-400 underline ml-2">CEB rates</a></div><select
    value={selectedPeriod}
    onChange={(e) => setSelectedPeriod(e.target.value)}
    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  ><option value="week">Weekly</option><option value="month">Monthly</option><option value="year">Yearly</option></select><button
    onClick={async () => {
      try {
        await reportApi.getEnergyReport(selectedPeriod);
        await fetch("/api/reports/recompute-day", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) }) });
        toast.success("Recompute triggered");
      } catch (err) {
        toast.error("Failed to trigger recompute");
      }
    }}
    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  >
            Recompute Day
          </button></div></div>{
    /* Summary Cards */
  }<div className="grid grid-cols-1 md:grid-cols-4 gap-6"><motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  ><div className="flex items-center"><div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Consumption</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalConsumption.toFixed(1)} kWh</p></div></div></motion.div><motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  ><div className="flex items-center"><div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"><DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">${totalCost.toFixed(2)}</p></div></div></motion.div><motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  ><div className="flex items-center"><div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center"><TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Average</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{avgDaily.toFixed(1)} kWh</p></div></div></motion.div><motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  ><div className="flex items-center"><div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center"><FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reports Generated</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">24</p></div></div></motion.div></div>{
    /* Charts */
  }<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{
    /* Energy Consumption Chart */
  }<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Energy Consumption Trends</h2><div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={mockEnergyData}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis
    dataKey="name"
    tick={{ fontSize: 12 }}
    className="text-gray-600 dark:text-gray-400"
  /><YAxis
    tick={{ fontSize: 12 }}
    className="text-gray-600 dark:text-gray-400"
  /><Tooltip
    contentStyle={{
      backgroundColor: "var(--tooltip-bg)",
      border: "1px solid var(--tooltip-border)",
      borderRadius: "8px"
    }}
  /><Bar dataKey="consumption" fill="#3B82F6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>{
    /* Device Usage Distribution */
  }<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Device Usage Distribution</h2><div className="h-80"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie
    data={reportData ? reportData.devices.map((d) => ({ name: d.name, consumption: d.energyKWh, percentage: 0, color: "#3B82F6" })) : mockDeviceData}
    cx="50%"
    cy="50%"
    outerRadius={100}
    fill="#8884d8"
    dataKey="consumption"
    label={({ name, percentage }) => `${name}: ${percentage}%`}
  >{(reportData ? reportData.devices : mockDeviceData).map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color || ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][index % 5]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></div></div>{
    /* Device Breakdown Table */
  }<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Device Energy Breakdown</h2><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Device</th><th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Consumption</th><th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Samples</th><th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Percentage</th><th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Cost</th></tr></thead><tbody>{(reportData ? reportData.devices : mockDeviceData).map((device, index) => <tr key={index} className="border-b border-gray-100 dark:border-gray-700"><td className="py-3 px-4"><div className="flex items-center"><div
    className="w-3 h-3 rounded-full mr-3"
    style={{ backgroundColor: device.color || ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][index % 5] }}
  /><span className="text-gray-900 dark:text-white">{device.name}</span></div></td><td className="py-3 px-4 text-gray-900 dark:text-white">{(() => {
    const kwh = device.energyKWh || device.consumption || 0;
    if (kwh < 1e-3) {
      return `${(kwh * 1e3).toFixed(2)} Wh`;
    }
    return `${kwh.toFixed(3)} kWh`;
  })()}</td><td className="py-3 px-4 text-gray-900 dark:text-white">{device.sampleCount || device.samples || 0}</td><td className="py-3 px-4 text-gray-900 dark:text-white">{device.percentage || "\u2014"}%</td><td className="py-3 px-4 text-gray-900 dark:text-white">
                        ${((device.energyKWh || device.consumption || 0) * costPerKwh).toFixed(2)}</td></tr>)}</tbody></table></div></div>{
    /* Download Options */
  }<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Download Reports</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => handleDownloadReport("pdf")}
    className="flex items-center justify-center px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
  ><Download className="h-5 w-5 mr-2 text-red-600" /><div className="text-left"><p className="font-medium text-gray-900 dark:text-white">PDF Report</p><p className="text-sm text-gray-600 dark:text-gray-400">Detailed formatted report</p></div></motion.button><motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => handleDownloadReport("csv")}
    className="flex items-center justify-center px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
  ><Download className="h-5 w-5 mr-2 text-green-600" /><div className="text-left"><p className="font-medium text-gray-900 dark:text-white">CSV Export</p><p className="text-sm text-gray-600 dark:text-gray-400">Raw data for analysis</p></div></motion.button><motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => handleDownloadReport("excel")}
    className="flex items-center justify-center px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
  ><Download className="h-5 w-5 mr-2 text-blue-600" /><div className="text-left"><p className="font-medium text-gray-900 dark:text-white">Excel Report</p><p className="text-sm text-gray-600 dark:text-gray-400">Spreadsheet with charts</p></div></motion.button></div></div></div>;
};
export {
  Reports
};
