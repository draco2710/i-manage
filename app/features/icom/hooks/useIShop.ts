import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getIShop, updateIShop } from '../api/ishop';
import { UpdateIShopRequest } from '../types/icom';

/**
 * Hook to manage global iShop profile data.
 * Note: Currently located in icom feature as it's primarily used in iCom membership context.
 */
export function useIShop(shopId?: string) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['ishop', shopId],
        queryFn: () => getIShop(shopId!),
        enabled: !!shopId,
    });

    const updateMutation = useMutation({
        mutationFn: (data: UpdateIShopRequest) => updateIShop(shopId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ishop', shopId] });
            // Also invalidate any membership queries that might include this shop info
            queryClient.invalidateQueries({ queryKey: ['member-detail', shopId] });
        },
    });

    return {
        ...query,
        updateIShop: updateMutation,
    };
}
