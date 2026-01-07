import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { listActions } from '@/features/icom-members/api/actions';
import ActionsContainer from '@/features/icom-members/components/ActionsContainer';

interface PageProps {
    params: Promise<{ id: string }>;
}

/**
 * Server Component for iCom Actions Management.
 * Prefetches action buttons to enable instant hydration.
 */
export default async function ActionsPage({ params }: PageProps) {
    const { id } = await params;
    const queryClient = new QueryClient();

    // Prefetch action buttons on the server
    await queryClient.prefetchQuery({
        queryKey: ['actions', id],
        queryFn: () => listActions(id),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ActionsContainer icomId={id} />
        </HydrationBoundary>
    );
}
