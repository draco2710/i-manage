'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

export function BottomNavigation() {
    const pathname = usePathname();

    const isIComActive = pathname?.startsWith('/icom');
    const isIShowroomActive = !isIComActive && (pathname === '/' || pathname?.startsWith('/ishowroom'));

    if (pathname === '/login' || pathname === '/register') {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-lg border-t border-gray-100 dark:border-white/5 pb-5 pt-3 px-6 md:hidden">
            <div className="flex justify-around items-center max-w-md mx-auto">
                <Link
                    href="/ishowroom"
                    className={clsx(
                        "flex flex-col items-center gap-1 transition-colors",
                        isIShowroomActive ? "text-primary dark:text-teal-400" : "text-gray-400 dark:text-gray-500 hover:text-primary"
                    )}
                >
                    <span className="material-symbols-outlined text-[28px] fill-current">storefront</span>
                    <span className="text-[10px] font-medium">iShowroom</span>
                </Link>

                <Link
                    href="/icom"
                    className={clsx(
                        "flex flex-col items-center gap-1 transition-colors",
                        isIComActive ? "text-primary dark:text-teal-400" : "text-gray-400 dark:text-gray-500 hover:text-primary"
                    )}
                >
                    <span className="material-symbols-outlined text-[28px] fill-current">groups</span>
                    <span className="text-[10px] font-medium">iCom</span>
                </Link>
            </div>
        </nav>
    );
}
