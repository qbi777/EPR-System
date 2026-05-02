/**
 * @file src/services/dashboardService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All API calls for the Dashboard & Health section.
 *
 * BACKEND CONTRACT:
 *   GET /dashboard/summary?period=month        → DashboardSummary
 *   GET /dashboard/monthly?year=2024           → MonthlyData[]
 *   GET /dashboard/comparison?yearA=2024&yearB=2023 → ComparisonData
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axiosClient from '../lib/axiosClient'
import { DASHBOARD_ENDPOINTS } from '../config/api'

export const fetchSummary = (period = 'month') =>
  axiosClient.get(DASHBOARD_ENDPOINTS.SUMMARY, { params: { period } })

export const fetchMonthlyData = (year) =>
  axiosClient.get(DASHBOARD_ENDPOINTS.MONTHLY, { params: { year } })

export const fetchComparison = (yearA, yearB) =>
  axiosClient.get(DASHBOARD_ENDPOINTS.COMPARISON, { params: { yearA, yearB } })
