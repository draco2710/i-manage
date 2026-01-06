// iCom Detail Page (SSR + Hydration)
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getICom, getIComStats } from '@/features/icom/api/icom';
import IComDetail from '@/features/icom/components/IComDetail';

interface PageProps {
    params: Promise<{ id: string }>;
}

/**
 * Server Component for the iCom detail page.
 * Prefetches profile and stats data to enable instant initial rendering.
 */
export default async function IComDetailPage({ params }: PageProps) {
    const { id } = await params;
    const queryClient = new QueryClient();

    // Prefetch critical data on the server
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ['icom', id],
            queryFn: () => getICom(id),
        }),
        queryClient.prefetchQuery({
            queryKey: ['icom-stats', id],
            queryFn: () => getIComStats(id),
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <IComDetail id={id} />
        </HydrationBoundary>
    );
}
