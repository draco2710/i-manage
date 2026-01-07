// iCom Shared Layout (SSR + Hydration)
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getICom } from '@/features/icom/api/icom';
import IComHeroWrapper from '@/features/icom/components/IComHeroWrapper';
import IComTabs from '@/features/icom/components/IComTabs';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}

/**
 * Shared layout for all iCom detail pages.
 * Handles server-side prefetching of the core iCom profile.
 */
export default async function IComLayout({ children, params }: LayoutProps) {
    const { id } = await params;
    const queryClient = new QueryClient();

    // Prefetch the core profile for the Hero and Tabs
    await queryClient.prefetchQuery({
        queryKey: ['icom', id],
        queryFn: () => getICom(id),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="min-h-screen bg-gray-50 pb-12">
                <IComHeroWrapper id={id} />

                <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
                    <IComTabs icomId={id} />
                    {children}
                </div>
            </div>
        </HydrationBoundary>
    );
}
