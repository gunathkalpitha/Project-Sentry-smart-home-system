import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function api(token) {
  const instance = axios.create({ baseURL: API_URL })
  if (token) {
    instance.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`
      return config
    })
  }
  return instance
}
