/**
 * @file src/services/itemsService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All API calls related to the Items / Products section.
 * Components and hooks never call axiosClient directly — they go through here.
 *
 * BACKEND CONTRACT (see src/config/api.js for full endpoint list):
 *
 *   GET  /items          → Item[]
 *   POST /items          → Item           body: ItemInput
 *   PUT  /items/:id      → Item           body: ItemInput
 *   DELETE /items/:id    → 204
 *   PATCH /items/:id/toggle → Item
 * ─────────────────────────────────────────────────────────────────────────────
 */

import axiosClient from '../lib/axiosClient'
import { ITEMS_ENDPOINTS } from '../config/api'

/**
 * Fetch all items from the backend.
 * @returns {Promise<Item[]>}
 */
export const fetchItems = () =>
  axiosClient.get(ITEMS_ENDPOINTS.LIST)

/**
 * Create a new item.
 * @param {ItemInput} data
 * @returns {Promise<Item>}
 */
export const createItem = (data) =>
  axiosClient.post(ITEMS_ENDPOINTS.CREATE, data)

/**
 * Update an existing item (full update).
 * @param {number|string} id
 * @param {ItemInput} data
 * @returns {Promise<Item>}
 */
export const updateItem = (id, data) =>
  axiosClient.put(ITEMS_ENDPOINTS.UPDATE(id), data)

/**
 * Delete an item by id.
 * @param {number|string} id
 * @returns {Promise<void>}
 */
export const deleteItem = (id) =>
  axiosClient.delete(ITEMS_ENDPOINTS.DELETE(id))

/**
 * Toggle an item's active state.
 * @param {number|string} id
 * @returns {Promise<Item>}
 */
export const toggleItem = (id) =>
  axiosClient.patch(ITEMS_ENDPOINTS.TOGGLE(id))
