import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getMemberDetail } from '@/features/icom-members/api/members';
import EditMemberContainer from '@/features/icom-members/components/EditMemberContainer';

interface PageProps {
    params: Promise<{ id: string; shopId: string }>;
}

/**
 * Server Component for Editing an iCom Member.
 * Prefetches membership details to enable instant hydration.
 */
export default async function EditMemberPage({ params }: PageProps) {
    const { id: icomId, shopId } = await params;
    const queryClient = new QueryClient();

    // Prefetch member details on the server
    await queryClient.prefetchQuery({
        queryKey: ['member-detail', icomId, shopId],
        queryFn: () => getMemberDetail(icomId, shopId),
    });

    const member = queryClient.getQueryData(['member-detail', icomId, shopId]);

    if (!member) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-gray-500">Member details not found.</p>
            </div>
        );
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EditMemberContainer icomId={icomId} shopId={shopId} member={member} />
        </HydrationBoundary>
    );
}
