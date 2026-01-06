import { useQuery } from '@tanstack/react-query';
import { getICom } from '../api/icom';

/**
 * Custom hook to fetch a single iCom profile by ID.
 */
export function useICom(id: string) {
    return useQuery({
        queryKey: ['icom', id],
        queryFn: () => getICom(id),
        enabled: !!id,
    });
}
