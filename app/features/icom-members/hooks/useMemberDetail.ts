import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMemberDetail, updateMemberStatus, addMember } from '../api/members';
import { AddMemberRequest, UpdateMemberStatusRequest } from '@/features/icom/types/icom';

/**
 * Hook to manage a specific member detail and status.
 */
export function useMemberDetail(icomId: string, shopId?: string) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['member-detail', icomId, shopId],
        queryFn: () => getMemberDetail(icomId, shopId!),
        enabled: !!icomId && !!shopId,
    });

    const updateStatusMutation = useMutation({
        mutationFn: (data: UpdateMemberStatusRequest) => updateMemberStatus(icomId, shopId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['member-detail', icomId, shopId] });
            queryClient.invalidateQueries({ queryKey: ['members', icomId] });
        },
    });

    const addMemberMutation = useMutation({
        mutationFn: (data: AddMemberRequest) => addMember(icomId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members', icomId] });
        },
    });

    return {
        ...query,
        updateStatus: updateStatusMutation,
        addMember: addMemberMutation,
    };
}
