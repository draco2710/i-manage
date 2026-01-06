import { useQuery } from '@tanstack/react-query';
import { getIComStats } from '../api/icom';

/**
 * Custom hook to fetch statistics for a specific iCom.
 */
export function useIComStats(id: string) {
    return useQuery({
        queryKey: ['icom-stats', id],
        queryFn: () => getIComStats(id),
        enabled: !!id,
    });
}
