'use client';

import Link from 'next/link';

/**
 * Global Not Found page.
 */
export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-icom-teal/10 text-icom-teal shadow-inner rotate-12">
                <span className="material-symbols-outlined text-5xl">person_search</span>
            </div>

            <h1 className="mb-2 text-display font-black text-gray-900 md:text-6xl">404</h1>
            <h2 className="mb-6 text-2xl font-bold text-gray-600">Page Not Found</h2>
            <p className="mb-10 max-w-md text-gray-500">
                The page you're looking for doesn't exist or has been moved.
                Please check the URL or head back home.
            </p>

            <Link
                href="/"
                className="flex items-center justify-center rounded-2xl bg-icom-teal px-10 py-4 font-black text-white shadow-xl shadow-teal-500/20 transition-all hover:bg-teal-600 hover:scale-105 active:scale-95"
            >
                <span className="material-symbols-outlined mr-2">home</span>
                Back to Dashboard
            </Link>
        </div>
    );
}
