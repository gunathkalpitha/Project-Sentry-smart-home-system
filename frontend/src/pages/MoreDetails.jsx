import React, { useEffect, useState } from 'react'
import { useAuth } from '../lib/useAuth.jsx'
import { api } from '../lib/api.js'

export default function MoreDetails() {
  const { token } = useAuth()
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    if (!token) return
    api(token).get('/reports/summary').then(res => setSummary(res.data))
  }, [token])

  return (
    <div className="bg-white rounded-2xl shadow p-6 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Summary</h2>
      {!summary ? <div>Loading...</div> : (
        <ul className="space-y-2 text-gray-700">
          <li><strong>Records:</strong> {summary.count}</li>
          <li><strong>Total Power:</strong> {summary.totalPower?.toFixed(2)} W</li>
          <li><strong>Range:</strong> {summary.from || '—'} → {summary.to || '—'}</li>
        </ul>
      )}
    </div>
  )
}
