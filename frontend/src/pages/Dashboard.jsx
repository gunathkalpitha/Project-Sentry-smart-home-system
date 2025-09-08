import React, { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth.jsx'
import { api } from '../lib/api.js'
import io from 'socket.io-client'
import Card from '../components/Card.jsx'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FaWifi } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000')

export default function Dashboard() {
  const { token } = useAuth()
  const [data, setData] = useState([])
  const [deviceConnected, setDeviceConnected] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return
    api(token).get('/device/status').then(res => setDeviceConnected(res.data.connected))
    api(token).get('/readings/latest?limit=30').then(res => setData(res.data))
  }, [token])

  useEffect(() => {
    socket.on('reading:new', (payload) => {
      setData(prev => [payload.reading, ...prev].slice(0, 30))
    })
    return () => socket.off('reading:new')
  }, [])

  const latest = data[0] || {}

  return (
    <div className="space-y-6">
      {/* Device Connection Status */}
      <div className="bg-white rounded-2xl shadow p-4 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FaWifi className={`text-2xl ${deviceConnected ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`font-semibold ${deviceConnected ? 'text-green-600' : 'text-red-600'}`}>
            {deviceConnected ? 'Device Connected' : 'Device Not Connected'}
          </span>
        </div>
        {!deviceConnected && (
          <button
            className="rounded-xl bg-gray-900 text-white px-4 py-2 hover:bg-gray-800"
            onClick={() => navigate('/wifi')}
          >
            Connect Wi-Fi
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Voltage (V)">{(latest.voltage ?? 0).toFixed(2)}</Card>
        <Card title="Current (A)">{(latest.current ?? 0).toFixed(2)}</Card>
        <Card title="Power (W)">{(latest.power ?? 0).toFixed(2)}</Card>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <div className="text-sm text-gray-500 mb-2">Live Power</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[...data].reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="createdAt" tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
              <YAxis />
              <Tooltip labelFormatter={(v) => new Date(v).toLocaleTimeString()} />
              <Line type="monotone" dataKey="power" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
