'use client';

import ErrorState from '@/components/ui/ErrorState';

export default function AddMemberError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="py-6">
            <ErrorState
                error={error}
                reset={reset}
                title="Form Error"
                message="We encountered an issue with the membership form. Please try resetting the form or going back to the members list."
            />
        </div>
    );
}
