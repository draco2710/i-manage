// API service for iCom operations

import type {
    IComProfile,
    IComListResponse,
    CreateIComRequest,
    UpdateIComRequest,
    IComStats,
    MessageResponse,
} from '../types/icom';

import apiClient from '@/lib/api/axios';

/**
 * Create a new iCom (community card)
 * @param data - iCom creation request data
 * @returns Created iCom profile
 */
export async function createICom(data: CreateIComRequest): Promise<IComProfile> {
    const response = await apiClient.post('/icom', data);
    return response.data;
}

/**
 * Get iCom profile by ID
 * @param id - iCom ID
 * @returns iCom profile data
 */
export async function getICom(id: string): Promise<IComProfile> {
    const response = await apiClient.get(`/icom/${id}`);
    return response.data;
}

/**
 * Update iCom profile information
 * @param id - iCom ID
 * @param data - Update request data
 * @returns Updated iCom profile
 */
export async function updateICom(id: string, data: UpdateIComRequest): Promise<IComProfile> {
    const response = await apiClient.put(`/icom/${id}`, data);
    return response.data;
}

/**
 * Delete iCom and all related data
 * @param id - iCom ID
 * @returns Success message
 */
export async function deleteICom(id: string): Promise<MessageResponse> {
    const response = await apiClient.delete(`/icom/${id}`);
    return response.data;
}

/**
 * Get iCom statistics
 * @param id - iCom ID
 * @returns iCom statistics including member counts and breakdowns
 */
export async function getIComStats(id: string): Promise<IComStats> {
    const response = await apiClient.get(`/icom/${id}/stats`);
    return response.data;
}

/**
 * List all iComs with pagination
 * @param page - Page number (default 1)
 * @param limit - Items per page (default 10)
 * @returns Paginated list of iComs
 */
export async function listIComs(page = 1, limit = 10): Promise<IComListResponse> {
    const response = await apiClient.get('/icom', {
        params: { page, limit }
    });
    return response.data;
}
