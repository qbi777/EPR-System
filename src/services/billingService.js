/**
 * @file src/services/billingService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All API calls for the Billing / POS section.
 *
 * BACKEND CONTRACT:
 *   GET  /bills          → Bill[]
 *   POST /bills          → Bill     body: BillInput
 *   GET  /bills/:id      → Bill
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axiosClient from '../lib/axiosClient'
import { BILLING_ENDPOINTS } from '../config/api'

/** Fetch all bills. @returns {Promise<Bill[]>} */
export const fetchBills = () =>
  axiosClient.get(BILLING_ENDPOINTS.LIST)

/**
 * Create a new bill (checkout). Also triggers stock deduction on the backend.
 * @param {BillInput} data - { items, subtotal, discount, total, paymentMode, cashier }
 * @returns {Promise<Bill>}
 */
export const createBill = (data) =>
  axiosClient.post(BILLING_ENDPOINTS.CREATE, data)

/** Fetch a single bill by id. @returns {Promise<Bill>} */
export const fetchBillById = (id) =>
  axiosClient.get(BILLING_ENDPOINTS.GET_ONE(id))
