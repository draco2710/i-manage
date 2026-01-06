'use client';

/**
 * Standardized Loading State component.
 * Can be used for skeletons, full-page loaders, or section loaders.
 */
export default function LoadingState({
    text = 'Loading data...',
    fullPage = false
}: {
    text?: string;
    fullPage?: boolean;
}) {
    const containerClasses = fullPage
        ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
        : "flex min-h-[400px] flex-col items-center justify-center p-8";

    return (
        <div className={containerClasses}>
            <div className="relative mb-6">
                {/* Orbiting Ring */}
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-icom-teal/20 border-t-icom-teal shadow-sm"></div>

                {/* Center Pulse */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-4 w-4 animate-pulse rounded-full bg-icom-teal shadow-icom-sm"></div>
                </div>
            </div>

            <p className="text-sm font-bold tracking-widest text-gray-400 uppercase animate-pulse">
                {text}
            </p>

            <div className="mt-4 flex space-x-1">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-icom-teal/30"></div>
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-icom-teal/50 [animation-delay:-0.15s]"></div>
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-icom-teal/70 [animation-delay:-0.3s]"></div>
            </div>
        </div>
    );
}
