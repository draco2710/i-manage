import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getLeaderboard } from '@/features/icom-members/api/members';
import LeaderboardContainer from '@/features/icom-members/components/LeaderboardContainer';

interface PageProps {
    params: Promise<{ id: string }>;
}

/**
 * Server Component for iCom Leaderboard.
 * Prefetches the leaderboard (interactions by default) to enable instant hydration.
 */
export default async function LeaderboardPage({ params }: PageProps) {
    const { id } = await params;
    const queryClient = new QueryClient();

    // Prefetch top interactions (default tab)
    await queryClient.prefetchQuery({
        queryKey: ['leaderboard', id, 'interactions'],
        queryFn: () => getLeaderboard(id, 'interactions'),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <LeaderboardContainer icomId={id} />
        </HydrationBoundary>
    );
}
