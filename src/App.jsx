import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
import { Toaster } from "react-hot-toast";
import { useTheme } from "./hooks/useTheme";
import { Sidebar } from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import { Dashboard } from "./pages/Dashboard";
import { Devices } from "./pages/Devices";
import { Analytics } from "./pages/Analytics";
import { WiFi } from "./pages/WiFi";
import { Security } from "./pages/Security";
import { Environmental } from "./pages/Environmental";
import { Reports } from "./pages/Reports";
import { Profile } from "./pages/Profile";
import { RaspberryPiPage } from "./pages/RaspberryPi";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { GoogleCallback } from "./pages/GoogleCallback";
import { socketService } from "./services/socket";
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);
  return <Router><div className="h-screen bg-gray-50 dark:bg-gray-900 flex"><Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /><div className="flex-1 flex flex-col overflow-hidden"><Header onMenuClick={() => setSidebarOpen(true)} /><main className="flex-1 overflow-x-hidden overflow-y-auto p-6"><Routes>{
    /* Public routes: login, signup, google callback */
  }<Route path="/" element={<PublicRoute><Login /></PublicRoute>} /><Route path="/login" element={<PublicRoute><Login /></PublicRoute>} /><Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} /><Route path="/google-callback" element={<GoogleCallback />} />{
    /* Protected routes: all app pages */
  }<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /><Route path="/devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} /><Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} /><Route path="/automation" element={<ProtectedRoute><div className="text-gray-600 dark:text-gray-400">Automation page coming soon...</div></ProtectedRoute>} /><Route path="/raspberrypi" element={<ProtectedRoute><RaspberryPiPage /></ProtectedRoute>} /><Route path="/wifi" element={<ProtectedRoute><WiFi /></ProtectedRoute>} /><Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} /><Route path="/environmental" element={<ProtectedRoute><Environmental /></ProtectedRoute>} /><Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} /><Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /><Route path="/settings" element={<ProtectedRoute><div className="text-gray-600 dark:text-gray-400">Settings page coming soon...</div></ProtectedRoute>} /></Routes></main></div><Toaster
    position="top-right"
    toastOptions={{
      className: "dark:bg-gray-800 dark:text-white",
      duration: 3e3
    }}
  /></div></Router>;
}
var stdin_default = App;
export {
  stdin_default as default
};
