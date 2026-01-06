import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteICom } from '../api/icom';

/**
 * Custom hook to delete an iCom community.
 */
export function useDeleteICom(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => deleteICom(id),
        onSuccess: () => {
            // Invalidate the list after deletion
            queryClient.invalidateQueries({ queryKey: ['icoms'] });
        },
    });
}
