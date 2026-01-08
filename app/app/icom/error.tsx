'use client';

import ErrorState from '@/components/ui/ErrorState';

/**
 * Error Boundary for the iCom Dashboard.
 * Catches errors in the community list or stats cards.
 */
export default function IComModuleError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="container mx-auto px-4 py-12">
            <ErrorState
                error={error}
                reset={reset}
                title="iCom Dashboard Error"
                message="We encountered an issue loading the community management module. Please try again."
            />
        </div>
    );
}
