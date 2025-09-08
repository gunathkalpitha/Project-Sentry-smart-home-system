import React, { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth.jsx'
import { api } from '../lib/api.js'

export default function Devices() {
  const { token } = useAuth()
  const [devices, setDevices] = useState([])

  useEffect(() => {
    if (!token) return
    api(token).get('/devices').then(res => setDevices(res.data))
  }, [token])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {devices.map(d => (
        <div key={d._id} className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">{d.name}</div>
              <div className="text-sm text-gray-500">{d.location || 'Unknown'}</div>
            </div>
            <div className={`text-xs px-2 py-1 rounded ${d.online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {d.online ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
