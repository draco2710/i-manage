import { useQuery } from '@tanstack/react-query';
import { listIComs } from '../api/icom';

/**
 * Custom hook to fetch the list of iComs with pagination.
 * This centralizes the query logic and enables easy reuse across components.
 */
export function useIComs(page = 1, limit = 100) {
    return useQuery({
        queryKey: ['icoms', page, limit],
        queryFn: () => listIComs(page, limit),
    });
}
