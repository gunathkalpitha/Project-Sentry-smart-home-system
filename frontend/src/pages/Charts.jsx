import React, { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth.jsx'
import { api } from '../lib/api.js'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts'

export default function Charts() {
  const { token } = useAuth()
  const [data, setData] = useState([])
  const [type, setType] = useState('line')

  useEffect(() => {
    if (!token) return
    api(token).get('/readings/latest?limit=100').then(res => setData(res.data.reverse()))
  }, [token])

  const Chart = () => {
    if (type === 'bar') return (
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="createdAt" tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
        <YAxis />
        <Tooltip labelFormatter={(v) => new Date(v).toLocaleTimeString()} />
        <Bar dataKey="power" />
      </BarChart>
    )
    if (type === 'area') return (
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="createdAt" tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
        <YAxis />
        <Tooltip labelFormatter={(v) => new Date(v).toLocaleTimeString()} />
        <Area type="monotone" dataKey="power" />
      </AreaChart>
    )
    return (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="createdAt" tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
        <YAxis />
        <Tooltip labelFormatter={(v) => new Date(v).toLocaleTimeString()} />
        <Line dataKey="power" dot={false} />
      </LineChart>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['line','bar','area'].map(t => (
          <button key={t} onClick={() => setType(t)} className={`px-3 py-1 rounded-xl border ${type===t?'bg-gray-900 text-white':'bg-white'}`}>{t.title()}</button>
        ))}
      </div>
      <div className="h-80 bg-white rounded-2xl shadow p-4">
        <div className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <Chart />
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
