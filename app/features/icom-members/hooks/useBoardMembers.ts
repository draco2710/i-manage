import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listBoardMembers, addBoardMember, updateBoardMember, removeBoardMember } from '../api/board';
import { AddBoardMemberRequest, UpdateBoardMemberRequest } from '@/features/icom/types/icom';

/**
 * Hook to manage board members.
 */
export function useBoardMembers(icomId: string) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['icom-board', icomId],
        queryFn: () => listBoardMembers(icomId),
        enabled: !!icomId,
    });

    const addMutation = useMutation({
        mutationFn: (data: AddBoardMemberRequest) => addBoardMember(icomId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['icom-board', icomId] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ memberId, data }: { memberId: string; data: UpdateBoardMemberRequest }) =>
            updateBoardMember(icomId, memberId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['icom-board', icomId] });
        },
    });

    const removeMutation = useMutation({
        mutationFn: (memberId: string) => removeBoardMember(icomId, memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['icom-board', icomId] });
        },
    });

    return {
        ...query,
        addBoardMember: addMutation,
        updateBoardMember: updateMutation,
        removeBoardMember: removeMutation,
    };
}
