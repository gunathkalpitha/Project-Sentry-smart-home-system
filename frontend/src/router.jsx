import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Charts from './pages/Charts.jsx'
import Devices from './pages/Devices.jsx'
import WifiSetup from './pages/WifiSetup.jsx'
import MoreDetails from './pages/MoreDetails.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import { useAuth } from './lib/useAuth.jsx'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/charts" element={<PrivateRoute><Charts /></PrivateRoute>} />
      <Route path="/devices" element={<PrivateRoute><Devices /></PrivateRoute>} />
      <Route path="/wifi" element={<PrivateRoute><WifiSetup /></PrivateRoute>} />
      <Route path="/more" element={<PrivateRoute><MoreDetails /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
