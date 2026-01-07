'use client';

import ErrorState from '@/components/ui/ErrorState';

export default function EditMemberError({
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
                title="Update Error"
                message="We encountered an issue loading or updating this member's details. Please try again."
            />
        </div>
    );
}
