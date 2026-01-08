import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listMembers, filterMembers, searchMembers, removeMember } from '../api/members';
import { FilterMembersRequest } from '@/features/icom/types/icom';

/**
 * Hook to manage members fetching, filtering and searching.
 */
export function useMembers(icomId: string, page = 1, limit = 20, filters?: FilterMembersRequest, searchQuery?: string) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['members', icomId, { page, limit, filters, searchQuery }],
        queryFn: () => {
            if (searchQuery) {
                return searchMembers(icomId, searchQuery, page, limit);
            }
            if (filters && Object.keys(filters).length > 0) {
                return filterMembers(icomId, filters);
            }
            return listMembers(icomId, page, limit);
        },
        enabled: !!icomId,
    });

    const removeMutation = useMutation({
        mutationFn: (shopId: string) => removeMember(icomId, shopId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members', icomId] });
        },
    });

    return {
        ...query,
        removeMember: removeMutation,
    };
}
