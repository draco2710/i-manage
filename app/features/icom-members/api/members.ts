// API service for iCom member management

import type {
    MemberSummary,
    MembershipDetail,
    MemberListResponse,
    AddMemberRequest,
    UpdateMemberStatusRequest,
    FilterMembersRequest,
    GeoSearchRequest,
    LeaderboardResponse,
    ToggleLikeRequest,
    MessageResponse,
} from '@/features/icom/types/icom';

import apiClient from '@/lib/api/axios';

/**
 * List all members with pagination
 * @param icomId - iCom ID
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 * @returns Paginated list of members
 */
export async function listMembers(
    icomId: string,
    page: number = 1,
    limit: number = 20
): Promise<MemberListResponse> {
    const response = await apiClient.get(`/icom/${icomId}/members`, {
        params: { page, limit }
    });
    return response.data;
}

/**
 * Filter members by various criteria
 * @param icomId - iCom ID
 * @param filters - Filter criteria
 * @returns Filtered list of members
 */
export async function filterMembers(
    icomId: string,
    filters: FilterMembersRequest
): Promise<MemberListResponse> {
    const response = await apiClient.post(`/icom/${icomId}/members/filter`, filters);
    return response.data;
}

/**
 * Global search using RediSearch
 */
export async function searchMembers(
    icomId: string,
    query: string,
    page: number = 1,
    limit: number = 20
): Promise<MemberListResponse> {
    const response = await apiClient.get(`/icom/${icomId}/search`, {
        params: { q: query, page, limit }
    });
    return response.data;
}

/**
 * Add a shop to iCom (creates new iShop in this iCom)
 */
export async function addMember(
    icomId: string,
    data: AddMemberRequest
): Promise<MessageResponse & { shopId: string }> {
    const response = await apiClient.post(`/icom/${icomId}/members`, data);
    return response.data;
}

/**
 * Get detailed membership information
 */
export async function getMemberDetail(icomId: string, shopId: string): Promise<MembershipDetail> {
    const response = await apiClient.get(`/icom/${icomId}/members/${shopId}`);
    // Support both direct data and wrapped { data: { ... } }
    const rawData = response.data?.data || response.data;

    // Ensure shop_id is present (aliased from id if necessary)
    return {
        ...rawData,
        shop_id: rawData.shop_id || rawData.id
    };
}

/**
 * Update member rank/status in iCom
 */
export async function updateMemberStatus(
    icomId: string,
    shopId: string,
    data: UpdateMemberStatusRequest
): Promise<MessageResponse> {
    const response = await apiClient.put(`/icom/${icomId}/members/${shopId}/status`, data);
    return response.data;
}

/**
 * Set custom display order for a member
 */
export async function updateMemberOrder(
    icomId: string,
    shopId: string,
    displayOrder: number
): Promise<MessageResponse> {
    const response = await apiClient.put(`/icom/${icomId}/members/${shopId}/order`, { displayOrder });
    return response.data;
}

/**
 * Remove a shop from iCom membership
 */
export async function removeMember(icomId: string, shopId: string): Promise<MessageResponse> {
    const response = await apiClient.delete(`/icom/${icomId}/members/${shopId}`);
    return response.data;
}

/**
 * Find shops near a location
 */
export async function geoSearchMembers(
    icomId: string,
    data: GeoSearchRequest
): Promise<MemberSummary[]> {
    const response = await apiClient.post(`/icom/${icomId}/geo-search`, data);
    return response.data;
}

/**
 * Get top shops by ranking type
 */
export async function getLeaderboard(
    icomId: string,
    type: 'likes' | 'interactions',
    limit: number = 10,
    source?: 'icom' | 'ishop'
): Promise<LeaderboardResponse> {
    const params: any = { type, limit };
    if (type === 'likes' && source) {
        params.source = source;
    }
    const response = await apiClient.get(`/icom/${icomId}/leaderboard`, { params });
    return response.data;
}

/**
 * Toggle like status for a shop (public endpoint)
 */
export async function toggleLike(
    icomId: string,
    shopId: string,
    data: ToggleLikeRequest
): Promise<MessageResponse & { status: 'liked' | 'unliked' }> {
    const response = await apiClient.post(`/icom/${icomId}/likes/${shopId}`, data);
    return response.data;
}

/**
 * Increment interaction score for ranking (public endpoint)
 */
export async function incrementInteractions(icomId: string, shopId: string): Promise<MessageResponse> {
    const response = await apiClient.post(`/icom/${icomId}/interactions/${shopId}`);
    return response.data;
}
