// iCom Overview Page (SSR + Hydration)
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { listIComs } from '@/features/icom/api/icom';
import IComDashboard from '@/features/icom/components/IComDashboard';

/**
 * Server Component for the iCom dashboard.
 * Prefetches the community list to enable instant initial rendering.
 */
export default async function IComPage() {
    const queryClient = new QueryClient();

    // Prefetch data on the server
    await queryClient.prefetchQuery({
        queryKey: ['icoms', 1, 100], // Must match the hook's initial state
        queryFn: () => listIComs(1, 100),
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <HydrationBoundary state={dehydrate(queryClient)}>
                <IComDashboard />
            </HydrationBoundary>
        </div>
    );
}
