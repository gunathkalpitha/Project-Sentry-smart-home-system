import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
const EnergyChart = ({ data, height = 300 }) => {
  const formatXAxis = (timestamp) => {
    return format(new Date(timestamp), "HH:mm");
  };
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"><p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{format(new Date(label), "MMM dd, HH:mm")}</p>{payload.map((entry) => <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>{entry.name}: {entry.value.toFixed(2)}{entry.dataKey === "power" ? "W" : entry.dataKey === "current" ? "A" : "V"}</p>)}</div>;
    }
    return null;
  };
  return <div className="w-full" style={{ height }}><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" className="opacity-30" /><XAxis
    dataKey="timestamp"
    tickFormatter={formatXAxis}
    tick={{ fontSize: 12 }}
    className="text-gray-600 dark:text-gray-400"
  /><YAxis tick={{ fontSize: 12 }} className="text-gray-600 dark:text-gray-400" /><Tooltip content={<CustomTooltip />} /><Legend /><Line
    type="monotone"
    dataKey="power"
    stroke="#3B82F6"
    strokeWidth={2}
    name="Power (W)"
    dot={{ r: 4 }}
    activeDot={{ r: 6 }}
  /><Line
    type="monotone"
    dataKey="current"
    stroke="#10B981"
    strokeWidth={2}
    name="Current (A)"
    dot={{ r: 4 }}
    activeDot={{ r: 6 }}
  /><Line
    type="monotone"
    dataKey="voltage"
    stroke="#F59E0B"
    strokeWidth={2}
    name="Voltage (V)"
    dot={{ r: 4 }}
    activeDot={{ r: 6 }}
  /></LineChart></ResponsiveContainer></div>;
};
export {
  EnergyChart
};
