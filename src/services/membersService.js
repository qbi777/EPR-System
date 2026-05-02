/**
 * @file src/services/membersService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All API calls for the Members section.
 *
 * BACKEND CONTRACT:
 *   GET    /members        → Member[]
 *   POST   /members        → Member
 *   PUT    /members/:id    → Member
 *   DELETE /members/:id    → 204
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axiosClient from '../lib/axiosClient'
import { MEMBERS_ENDPOINTS } from '../config/api'

export const fetchMembers  = ()        => axiosClient.get(MEMBERS_ENDPOINTS.LIST)
export const createMember  = (data)    => axiosClient.post(MEMBERS_ENDPOINTS.CREATE, data)
export const updateMember  = (id, data)=> axiosClient.put(MEMBERS_ENDPOINTS.UPDATE(id), data)
export const deleteMember  = (id)      => axiosClient.delete(MEMBERS_ENDPOINTS.DELETE(id))
