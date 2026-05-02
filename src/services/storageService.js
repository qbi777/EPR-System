/**
 * @file src/services/storageService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All API calls for the Storage section.
 *
 * BACKEND CONTRACT:
 *   GET   /storage                              → StockEntry[]
 *   POST  /storage                              → StockEntry
 *   PUT   /storage/:id                          → StockEntry
 *   GET   /storage/recommendations              → Recommendation[]
 *   PATCH /storage/recommendations/:id/approve  → Recommendation
 *   PATCH /storage/recommendations/:id/reject   → Recommendation
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axiosClient from '../lib/axiosClient'
import { STORAGE_ENDPOINTS } from '../config/api'

export const fetchStorage = () =>
  axiosClient.get(STORAGE_ENDPOINTS.LIST)

export const createStockEntry = (data) =>
  axiosClient.post(STORAGE_ENDPOINTS.CREATE, data)

export const updateStockEntry = (id, data) =>
  axiosClient.put(STORAGE_ENDPOINTS.UPDATE(id), data)

export const fetchRecommendations = () =>
  axiosClient.get(STORAGE_ENDPOINTS.RECOMMENDATIONS)

export const approveRecommendation = (id) =>
  axiosClient.patch(STORAGE_ENDPOINTS.APPROVE_REC(id))

export const rejectRecommendation = (id) =>
  axiosClient.patch(STORAGE_ENDPOINTS.REJECT_REC(id))
