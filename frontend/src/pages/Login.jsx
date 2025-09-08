import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth.jsx'
import { api } from '../lib/api.js'
import { FaEnvelope, FaLock } from 'react-icons/fa'

export default function Login() {
  const { login, user } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')        // start empty
  const [password, setPassword] = useState('')  // start empty
  const [err, setErr] = useState('')

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) nav('/')
  }, [user, nav])

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const res = await api().post('/auth/login', { email, password })
      login(res.data.token)
      nav('/')
    } catch (e) {
      setErr(e?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-100">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6 w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FaEnvelope />
          </span>
          <input
            className="w-full border rounded-xl px-10 py-2"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FaLock />
          </span>
          <input
            className="w-full border rounded-xl px-10 py-2"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button className="w-full rounded-xl bg-gray-900 text-white py-2">Log in</button>
        <div className="text-sm text-gray-600">
          No account? <Link className="underline" to="/signup">Create one</Link>
        </div>
      </form>
    </div>
  )
}
