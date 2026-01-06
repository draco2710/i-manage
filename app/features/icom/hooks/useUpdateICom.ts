import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateICom } from '../api/icom';
import { CreateIComRequest } from '../types/icom';

/**
 * Custom hook to update an iCom profile.
 * Automatically invalidates relevant queries on success.
 */
export function useUpdateICom(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateIComRequest) => updateICom(id, data),
        onSuccess: () => {
            // Invalidate the specific icom and the list
            queryClient.invalidateQueries({ queryKey: ['icom', id] });
            queryClient.invalidateQueries({ queryKey: ['icoms'] });
        },
    });
}
