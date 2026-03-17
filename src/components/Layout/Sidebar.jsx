import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Zap,
  BarChart3,
  Settings,
  Wifi,
  Clock,
  FileText,
  Shield,
  User,
  Thermometer,
  Cpu,
  HelpCircle
} from "lucide-react";
const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Devices", href: "/devices", icon: Zap },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Automation", href: "/automation", icon: Clock },
  { name: "Raspberry Pi", href: "/raspberrypi", icon: Cpu },
  { name: "WiFi Settings", href: "/wifi", icon: Wifi },
  { name: "Security", href: "/security", icon: Shield },
  { name: "Environmental", href: "/environmental", icon: Thermometer },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings }
];
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  return <>{
    /* Mobile backdrop */
  }{isOpen && <div
    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
    onClick={onClose}
  />}{
    /* Sidebar */
  }<div
    className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:block`}
  ><div className="flex flex-col h-full">{
    /* Logo */
  }<div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700"><div className="flex items-center"><div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div><span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                Sentry
              </span></div></div>{
    /* Navigation */
  }<nav className="flex-1 px-4 py-4 space-y-2">{navigation.map((item) => {
    const isActive = location.pathname === item.href;
    return <Link
      key={item.name}
      to={item.href}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
      onClick={() => window.innerWidth < 1024 && onClose()}
    ><item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`} />{item.name}</Link>;
  })}</nav>{
    /* Help */
  }<div className="p-4 border-t border-gray-200 dark:border-gray-700"><Link
    to="/help"
    className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
  ><HelpCircle className="mr-3 h-5 w-5" />
              Help & Support
            </Link></div></div></div></>;
};
export {
  Sidebar
};
