import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getMemberDetail } from '@/features/icom-members/api/members';
import MemberDetailContainer from '@/features/icom-members/components/MemberDetailContainer';
import { MembershipDetail } from '@/features/icom/types/icom';

interface PageProps {
    params: Promise<{ id: string; shopId: string }>;
}

/**
 * Server Component for viewing an iCom Member's detail.
 * Prefetches data for hydration.
 */
export default async function MemberDetailPage({ params }: PageProps) {
    const { id: icomId, shopId } = await params;
    const queryClient = new QueryClient();

    // Prefetch for hydration
    await queryClient.prefetchQuery({
        queryKey: ['member-detail', icomId, shopId],
        queryFn: () => getMemberDetail(icomId, shopId),
    });

    const member = queryClient.getQueryData(['member-detail', icomId, shopId]) as MembershipDetail;

    if (!member) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-white shadow-icom-sm">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">error</span>
                <p className="text-gray-500 font-medium">Member details not found.</p>
            </div>
        );
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MemberDetailContainer icomId={icomId} shopId={shopId} member={member} />
        </HydrationBoundary>
    );
}
