/**
 * @file src/services/auditService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All API calls for the Audit Log.
 *
 * BACKEND CONTRACT:
 *   GET  /audit-log?section=Items&limit=50  → AuditEntry[]
 *   POST /audit-log/:id/revert              → AuditEntry (updated with reverted=true)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axiosClient from '../lib/axiosClient'
import { AUDIT_ENDPOINTS } from '../config/api'

export const fetchAuditLog  = (params = {}) => axiosClient.get(AUDIT_ENDPOINTS.LIST, { params })
export const revertAuditEntry = (id)        => axiosClient.post(AUDIT_ENDPOINTS.REVERT(id))
