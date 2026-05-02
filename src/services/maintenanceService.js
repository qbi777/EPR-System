/**
 * @file src/services/maintenanceService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All API calls for the Maintenance / Assets section.
 *
 * BACKEND CONTRACT:
 *   GET  /assets              → Asset[]
 *   POST /assets              → Asset
 *   PUT  /assets/:id          → Asset
 *   POST /assets/:id/events   → AssetEvent
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axiosClient from '../lib/axiosClient'
import { MAINTENANCE_ENDPOINTS } from '../config/api'

export const fetchAssets    = ()         => axiosClient.get(MAINTENANCE_ENDPOINTS.LIST)
export const createAsset    = (data)     => axiosClient.post(MAINTENANCE_ENDPOINTS.CREATE, data)
export const updateAsset    = (id, data) => axiosClient.put(MAINTENANCE_ENDPOINTS.UPDATE(id), data)
export const addAssetEvent  = (id, data) => axiosClient.post(MAINTENANCE_ENDPOINTS.ADD_EVENT(id), data)
