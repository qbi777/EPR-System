/**
 * @file src/lib/axiosClient.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Axios instance.
 * All service files import THIS — never bare `axios` directly.
 *
 * Responsibilities:
 *  • Set base URL + timeout from config
 *  • Attach Authorization header on every request (JWT Bearer token)
 *  • Handle 401 → clear token + redirect to login
 *  • Standardise error shape so services always reject with { message, status }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import axios from 'axios'
import { API_CONFIG } from '../config/api'

// ── Create the shared instance ────────────────────────────────────────────────
const axiosClient = axios.create({
  baseURL:  API_CONFIG.BASE_URL,
  timeout:  API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
})

// ── Request interceptor — attach JWT token ────────────────────────────────────
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ll_auth_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — normalise errors ───────────────────────────────────
axiosClient.interceptors.response.use(
  // 2xx: return response data directly so services don't need `.data`
  (response) => response.data,

  // Non-2xx: normalise and reject
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message || error.message || 'Network error'

    // 401 Unauthorised — token expired or invalid
    if (status === 401) {
      localStorage.removeItem('ll_auth_token')
      // Redirect to login; adjust path to match your router setup
      window.location.href = '/login'
    }

    // 403 Forbidden — show a user-friendly message
    if (status === 403) {
      console.warn('[API] Access denied:', message)
    }

    // 5xx — server errors
    if (status >= 500) {
      console.error('[API] Server error:', status, message)
    }

    return Promise.reject({ message, status, raw: error })
  }
)

export default axiosClient
