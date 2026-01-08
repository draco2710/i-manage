// API service for iCom action button management

import type {
    ActionButton,
    AddActionRequest,
    UpdateActionRequest,
    MessageResponse,
} from '@/features/icom/types/icom';
import apiClient from '@/lib/api/axios';

/**
 * Get all action buttons for an iCom
 * @param icomId - iCom ID
 * @returns Array of action buttons
 */
export async function listActions(icomId: string): Promise<ActionButton[]> {
    const response = await apiClient.get(`/icom/${icomId}/actions`);
    return response.data;
}

/**
 * Add a functional action button
 * @param icomId - iCom ID
 * @param data - Action details
 * @returns Success message with action ID
 */
export async function addAction(
    icomId: string,
    data: AddActionRequest
): Promise<MessageResponse & { actionId: string }> {
    const response = await apiClient.post(`/icom/${icomId}/actions`, data);
    return response.data;
}

/**
 * Update action button information
 * @param icomId - iCom ID
 * @param actionId - Action ID
 * @param data - Update details
 * @returns Success message
 */
export async function updateAction(
    icomId: string,
    actionId: string,
    data: UpdateActionRequest
): Promise<MessageResponse> {
    const response = await apiClient.put(`/icom/${icomId}/actions/${actionId}`, data);
    return response.data;
}

/**
 * Delete an action button
 * @param icomId - iCom ID
 * @param actionId - Action ID
 * @returns Success message
 */
export async function removeAction(icomId: string, actionId: string): Promise<MessageResponse> {
    const response = await apiClient.delete(`/icom/${icomId}/actions/${actionId}`);
    return response.data;
}
