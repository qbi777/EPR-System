/**
 * @file src/services/purchasesService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All API calls for the Purchases section.
 *
 * BACKEND CONTRACT:
 *   GET  /purchases   → Purchase[]
 *   POST /purchases   → Purchase
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axiosClient from '../lib/axiosClient'
import { PURCHASES_ENDPOINTS } from '../config/api'

export const fetchPurchases  = ()      => axiosClient.get(PURCHASES_ENDPOINTS.LIST)
export const createPurchase  = (data)  => axiosClient.post(PURCHASES_ENDPOINTS.CREATE, data)
