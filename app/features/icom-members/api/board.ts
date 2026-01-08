// API service for iCom board member management

import type {
    BoardMember,
    AddBoardMemberRequest,
    UpdateBoardMemberRequest,
    MessageResponse,
} from '@/features/icom/types/icom';
import apiClient from '@/lib/api/axios';

/**
 * Get all board members for an iCom
 * @param icomId - iCom ID
 * @returns Array of board members
 */
export async function listBoardMembers(icomId: string): Promise<BoardMember[]> {
    const response = await apiClient.get(`/icom/${icomId}/board`);
    return response.data;
}

/**
 * Add a member to the board of directors
 * @param icomId - iCom ID
 * @param data - Board member details
 * @returns Success message with member ID
 */
export async function addBoardMember(
    icomId: string,
    data: AddBoardMemberRequest
): Promise<MessageResponse & { memberId: string }> {
    const response = await apiClient.post(`/icom/${icomId}/board`, data);
    return response.data;
}

/**
 * Update board member information
 * @param icomId - iCom ID
 * @param memberId - Board member ID
 * @param data - Update details
 * @returns Success message
 */
export async function updateBoardMember(
    icomId: string,
    memberId: string,
    data: UpdateBoardMemberRequest
): Promise<MessageResponse> {
    const response = await apiClient.put(`/icom/${icomId}/board/${memberId}`, data);
    return response.data;
}

/**
 * Remove a member from the board
 * @param icomId - iCom ID
 * @param memberId - Board member ID
 * @returns Success message
 */
export async function removeBoardMember(icomId: string, memberId: string): Promise<MessageResponse> {
    const response = await apiClient.delete(`/icom/${icomId}/board/${memberId}`);
    return response.data;
}
