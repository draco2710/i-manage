'use client';

import ErrorState from '@/components/ui/ErrorState';

/**
 * Error Boundary for iCom detail views.
 * Ensures that if a member list or board crashes, the shared layout 
 * (Hero/Tabs) remains functional so we can navigate away.
 */
export default function IComDetailError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="py-12">
            <ErrorState
                error={error}
                reset={reset}
                title="View Error"
                message="We encountered an issue loading this specific view. The rest of the iCom management is still active."
            />
        </div>
    );
}
