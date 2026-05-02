/**
 * @file src/services/expensesService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All API calls for the Expenses section.
 *
 * BACKEND CONTRACT:
 *   GET    /expenses        → Expense[]
 *   POST   /expenses        → Expense
 *   DELETE /expenses/:id    → 204
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axiosClient from '../lib/axiosClient'
import { EXPENSES_ENDPOINTS } from '../config/api'

export const fetchExpenses  = ()       => axiosClient.get(EXPENSES_ENDPOINTS.LIST)
export const createExpense  = (data)   => axiosClient.post(EXPENSES_ENDPOINTS.CREATE, data)
export const deleteExpense  = (id)     => axiosClient.delete(EXPENSES_ENDPOINTS.DELETE(id))
