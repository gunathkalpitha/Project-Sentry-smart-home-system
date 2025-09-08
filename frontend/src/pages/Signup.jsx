import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa'

export default function Signup() {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setOk('')
    try {
      await api().post('/auth/signup', { name, email, password })
      setOk('Account created. You can log in.')
      setTimeout(() => nav('/login'), 800)
    } catch (e) {
      setErr(e?.response?.data?.message || 'Sign up failed')
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-100">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6 w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Create account</h1>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FaUser />
          </span>
          <input
            className="w-full border rounded-xl px-10 py-2"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
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
        {ok && <div className="text-sm text-green-700">{ok}</div>}
        <button className="w-full rounded-xl bg-gray-900 text-white py-2">Sign up</button>
        <div className="text-sm text-gray-600">Have an account? <Link className="underline" to="/login">Log in</Link></div>
      </form>
    </div>
  )
}
