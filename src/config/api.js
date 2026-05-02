/**
 * @file src/config/api.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for all API configuration.
 *
 * ► HOW TO CONNECT YOUR BACKEND
 *   1. Set VITE_API_BASE_URL in your .env file:
 *        VITE_API_BASE_URL=http://localhost:8000/api/v1
 *   2. Set VITE_API_TIMEOUT if needed (default: 15000ms)
 *   3. Every endpoint path is defined below — search for the feature
 *      you need and update the path if your backend uses different naming.
 *
 * ► BACKEND DEV NOTE
 *   All paths listed here are the expected REST endpoints.
 *   The frontend calls them exactly as defined — no additional config needed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Base configuration ────────────────────────────────────────────────────────
export const API_CONFIG = {
  /** Root URL of the backend API. Set via environment variable. */
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',

  /** Request timeout in milliseconds */
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,

  /** API version prefix (already included in BASE_URL above) */
  VERSION: 'v1',
}

// ── Auth endpoints ────────────────────────────────────────────────────────────
export const AUTH_ENDPOINTS = {
  LOGIN:          '/auth/login',           // POST  { username, password } → { token, user }
  LOGOUT:         '/auth/logout',          // POST  → 200
  REFRESH:        '/auth/refresh',         // POST  { refreshToken } → { token }
  ME:             '/auth/me',              // GET   → { id, name, role, shopId }
}

// ── Items / Products endpoints ────────────────────────────────────────────────
export const ITEMS_ENDPOINTS = {
  LIST:           '/items',                // GET   → Item[]
  CREATE:         '/items',               // POST  ItemInput → Item
  UPDATE:         (id) => `/items/${id}`, // PUT   ItemInput → Item
  DELETE:         (id) => `/items/${id}`, // DELETE → 204
  TOGGLE:         (id) => `/items/${id}/toggle`, // PATCH → Item
}

// ── Storage / Stock endpoints ─────────────────────────────────────────────────
export const STORAGE_ENDPOINTS = {
  LIST:           '/storage',                       // GET   → StockEntry[]
  CREATE:         '/storage',                      // POST  StockEntryInput → StockEntry
  UPDATE:         (id) => `/storage/${id}`,        // PUT   StockEntryInput → StockEntry
  RECOMMENDATIONS:'/storage/recommendations',      // GET   → Recommendation[]
  APPROVE_REC:    (id) => `/storage/recommendations/${id}/approve`, // PATCH → Recommendation
  REJECT_REC:     (id) => `/storage/recommendations/${id}/reject`,  // PATCH → Recommendation
}

// ── Billing / POS endpoints ───────────────────────────────────────────────────
export const BILLING_ENDPOINTS = {
  LIST:           '/bills',                // GET   → Bill[]
  CREATE:         '/bills',              // POST  BillInput → Bill
  GET_ONE:        (id) => `/bills/${id}`, // GET   → Bill
}

// ── Purchases endpoints ───────────────────────────────────────────────────────
export const PURCHASES_ENDPOINTS = {
  LIST:           '/purchases',            // GET   → Purchase[]
  CREATE:         '/purchases',           // POST  PurchaseInput → Purchase
}

// ── Expenses endpoints ────────────────────────────────────────────────────────
export const EXPENSES_ENDPOINTS = {
  LIST:           '/expenses',             // GET   → Expense[]
  CREATE:         '/expenses',            // POST  ExpenseInput → Expense
  DELETE:         (id) => `/expenses/${id}`, // DELETE → 204
}

// ── Members endpoints ─────────────────────────────────────────────────────────
export const MEMBERS_ENDPOINTS = {
  LIST:           '/members',                      // GET   → Member[]
  CREATE:         '/members',                     // POST  MemberInput → Member
  UPDATE:         (id) => `/members/${id}`,       // PUT   MemberInput → Member
  DELETE:         (id) => `/members/${id}`,       // DELETE → 204
}

// ── Maintenance / Assets endpoints ───────────────────────────────────────────
export const MAINTENANCE_ENDPOINTS = {
  LIST:             '/assets',                              // GET   → Asset[]
  CREATE:           '/assets',                            // POST  AssetInput → Asset
  UPDATE:           (id) => `/assets/${id}`,              // PUT   AssetInput → Asset
  ADD_EVENT:        (id) => `/assets/${id}/events`,       // POST  AssetEventInput → AssetEvent
}

// ── Dashboard / Analytics endpoints ──────────────────────────────────────────
export const DASHBOARD_ENDPOINTS = {
  SUMMARY:        '/dashboard/summary',            // GET   ?period=month → DashboardSummary
  MONTHLY:        '/dashboard/monthly',            // GET   ?year=2024 → MonthlyData[]
  COMPARISON:     '/dashboard/comparison',         // GET   ?yearA=2024&yearB=2023 → ComparisonData
}

// ── Audit log endpoint ────────────────────────────────────────────────────────
export const AUDIT_ENDPOINTS = {
  LIST:           '/audit-log',             // GET   ?section=Items&limit=50 → AuditEntry[]
  REVERT:         (id) => `/audit-log/${id}/revert`, // POST → AuditEntry
}
