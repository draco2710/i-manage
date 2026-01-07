'use client';

import ErrorState from '@/components/ui/ErrorState';

/**
 * Root Error Boundary for the entire application.
 * Catch-all for any uncaught errors.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <ErrorState
                error={error}
                reset={reset}
                title="Application Error"
                message="We encountered a critical error. Please try refreshing the application."
            />
        </div>
    );
}
