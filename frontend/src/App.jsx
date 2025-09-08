import React from 'react'
import AppRoutes from './router.jsx'
import Sidebar from './components/Sidebar.jsx'
import { AuthProvider } from './lib/useAuth.jsx'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex bg-gray-50 text-gray-900">
        <Sidebar />
        <main className="flex-1 p-6">
          <AppRoutes />
        </main>
      </div>
    </AuthProvider>
  )
}
