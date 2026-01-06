'use client';

import LoadingState from '@/components/ui/LoadingState';

/**
 * Loading state for the main iCom dashboard list.
 */
export default function IComDashboardLoading() {
    return (
        <div className="flex h-[80vh] items-center justify-center">
            <LoadingState text="Syncing communities..." fullPage={true} />
        </div>
    );
}
