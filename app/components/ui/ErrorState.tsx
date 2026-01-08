'use client';

import { useEffect } from 'react';

interface ErrorStateProps {
    error: Error & { digest?: string };
    reset: () => void;
    title?: string;
    message?: string;
}

export default function ErrorState({
    error,
    reset,
    title = 'Something went wrong!',
    message = 'An unexpected error occurred. We have been notified and are working on a fix.'
}: ErrorStateProps) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Runtime Error:', error);
    }, [error]);

    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-icom-sm border border-gray-100">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-inner">
                <span className="material-symbols-outlined text-4xl">error</span>
            </div>

            <h2 className="mb-2 text-2xl font-bold text-gray-900">{title}</h2>
            <p className="mb-8 max-w-md text-gray-500 leading-relaxed">
                {error.message || message}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
                <button
                    onClick={() => reset()}
                    className="flex items-center justify-center rounded-xl bg-icom-teal px-8 py-3 font-bold text-white shadow-lg transition-all hover:bg-teal-600 hover:shadow-teal-500/25 active:scale-95"
                >
                    <span className="material-symbols-outlined mr-2">refresh</span>
                    Try again
                </button>

                <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center justify-center rounded-xl bg-gray-100 px-8 py-3 font-bold text-gray-700 transition-all hover:bg-gray-200 active:scale-95"
                >
                    <span className="material-symbols-outlined mr-2">home</span>
                    Back to Home
                </button>
            </div>

            {error.digest && (
                <p className="mt-8 text-xs font-mono text-gray-300">
                    Error ID: {error.digest}
                </p>
            )}
        </div>
    );
}
