'use client';

import StatGrid from './StatGrid';
import IndustryChart from './charts/IndustryChart';
import LocationChart from './charts/LocationChart';
import { useICom } from '../hooks/useICom';
import { useIComStats } from '../hooks/useIComStats';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface IComDetailProps {
    id: string;
}

/**
 * IComDetail component orchestrates the detail view for an iCom.
 * It uses specialized sub-components for a modular architecture.
 */
export default function IComDetail({ id }: IComDetailProps) {
    const { data: icom, isLoading: isIComLoading } = useICom(id);
    const { data: stats, isLoading: isStatsLoading } = useIComStats(id);

    if (isIComLoading && !icom) {
        return <LoadingSpinner fullScreen />;
    }

    if (!icom) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-gray-500">iCom not found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <StatGrid icom={icom} stats={stats || null} />

            <div className="grid gap-6 lg:grid-cols-2">
                <IndustryChart stats={stats || null} totalMembers={icom.total_members} />
                <LocationChart stats={stats || null} />
            </div>
        </div>
    );
}
