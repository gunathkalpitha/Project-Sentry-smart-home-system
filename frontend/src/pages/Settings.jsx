import React from 'react'

export default function Settings() {
  return (
    <div className="bg-white rounded-2xl shadow p-6 max-w-2xl space-y-4">
      <h2 className="text-xl font-semibold">Settings</h2>
      <div className="text-gray-600">Put environment and UI settings here (e.g., theme, API URL).</div>
      <div className="text-sm text-gray-500">Set <code>VITE_API_URL</code> and <code>VITE_WS_URL</code> in a <code>.env</code> file for the frontend.</div>
    </div>
  )
}
