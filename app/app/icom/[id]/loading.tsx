'use client';

import LoadingState from '@/components/ui/LoadingState';

/**
 * Shared loading state for all iCom detail views.
 */
export default function IComDetailLoading() {
    return (
        <div className="py-20">
            <LoadingState text="Preparing your view..." />
        </div>
    );
}
