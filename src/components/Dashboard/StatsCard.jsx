import { motion } from "framer-motion";
const colorClasses = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
  red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
};
const StatsCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color
}) => {
  return <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
  ><div className="flex items-center"><div className={`p-3 rounded-lg ${colorClasses[color]}`}><Icon className="h-6 w-6" /></div><div className="ml-4 flex-1"><p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p><p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p><p className={`text-sm ${changeType === "positive" ? "text-green-600 dark:text-green-400" : changeType === "negative" ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>{change}</p></div></div></motion.div>;
};
export {
  StatsCard
};
