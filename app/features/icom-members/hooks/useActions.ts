import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listActions, addAction, updateAction, removeAction } from '../api/actions';
import { AddActionRequest, UpdateActionRequest } from '@/features/icom/types/icom';

/**
 * Hook to manage icom action buttons.
 */
export function useActions(icomId: string) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['icom-actions', icomId],
        queryFn: async () => {
            const data = await listActions(icomId);
            return data.sort((a, b) => (a.order || 0) - (b.order || 0));
        },
        enabled: !!icomId,
    });

    const addMutation = useMutation({
        mutationFn: (data: AddActionRequest) => addAction(icomId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['icom-actions', icomId] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ actionId, data }: { actionId: string; data: UpdateActionRequest }) =>
            updateAction(icomId, actionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['icom-actions', icomId] });
        },
    });

    const removeMutation = useMutation({
        mutationFn: (actionId: string) => removeAction(icomId, actionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['icom-actions', icomId] });
        },
    });

    return {
        ...query,
        addAction: addMutation,
        updateAction: updateMutation,
        removeAction: removeMutation,
    };
}
