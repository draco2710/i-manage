// iCom Members Management Page
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getICom } from '@/features/icom/api/icom';
import { listMembers } from '@/features/icom-members/api/members';
import { IComMemberList } from '@/features/icom-members/components/IComMemberList';

interface PageProps {
    params: Promise<{ id: string }>;
}

/**
 * Server Component that prefetches member data for hydration.
 */
export default async function MembersPage({ params }: PageProps) {
    const { id } = await params;
    const queryClient = new QueryClient();

    // Prefetch critical data on the server
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ['members', id, {}],
            queryFn: () => listMembers(id),
        }),
        queryClient.prefetchQuery({
            queryKey: ['icom', id],
            queryFn: () => getICom(id),
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <IComMemberList icomId={id} />
        </HydrationBoundary>
    );
}
