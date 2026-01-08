// API service for iShop operations

import type {
    IShopProfile,
    UpdateIShopRequest,
    MessageResponse,
} from '../types/icom';
import apiClient from '@/lib/api/axios';

/**
 * Get iShop details
 * @param id - iShop ID
 * @returns iShop profile
 */
export async function getIShop(id: string): Promise<IShopProfile> {
    const response = await apiClient.get(`/ishop/${id}`);
    return response.data;
}

/**
 * Update iShop profile
 * @param id - iShop ID
 * @param data - Update request data
 * @returns Success message
 */
export async function updateIShop(id: string, data: UpdateIShopRequest): Promise<MessageResponse> {
    const response = await apiClient.put(`/ishop/${id}`, data);
    return response.data;
}

/**
 * Delete iShop (globally, usually admin only)
 */
export async function deleteIShop(id: string): Promise<MessageResponse> {
    const response = await apiClient.delete(`/ishop/${id}`);
    return response.data;
}
