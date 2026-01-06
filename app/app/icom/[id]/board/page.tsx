import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { listBoardMembers } from '@/features/icom-members/api/board';
import BoardContainer from '@/features/icom-members/components/BoardContainer';

interface PageProps {
    params: Promise<{ id: string }>;
}

/**
 * Server Component for iCom Board Management.
 * Prefetches board members to enable instant hydration.
 */
export default async function BoardPage({ params }: PageProps) {
    const { id } = await params;
    const queryClient = new QueryClient();

    // Prefetch board members on the server
    await queryClient.prefetchQuery({
        queryKey: ['board-members', id],
        queryFn: () => listBoardMembers(id),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <BoardContainer icomId={id} />
        </HydrationBoundary>
    );
}
