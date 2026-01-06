import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getICom } from '@/features/icom/api/icom';
import IComEditContainer from '@/features/icom/components/IComEditContainer';

interface PageProps {
    params: Promise<{ id: string }>;
}

/**
 * Server Component for the iCom edit page.
 * Prefetches the iCom data to ensure the form is populated instantly.
 */
export default async function IComEditPage({ params }: PageProps) {
    const { id } = await params;
    const queryClient = new QueryClient();

    // Prefetch iCom data on the server
    await queryClient.prefetchQuery({
        queryKey: ['icom', id],
        queryFn: () => getICom(id),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <IComEditContainer id={id} />
        </HydrationBoundary>
    );
}
