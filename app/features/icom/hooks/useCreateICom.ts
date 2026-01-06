import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createICom } from '../api/icom';
import { CreateIComRequest } from '../types/icom';

/**
 * Custom hook to create a new iCom.
 * Automatically invalidates list query on success.
 */
export function useCreateICom() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateIComRequest) => createICom(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['icoms'] });
        },
    });
}
