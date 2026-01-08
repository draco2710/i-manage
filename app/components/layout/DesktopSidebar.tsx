'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { logout } from '@/app/actions/logout';

export function DesktopSidebar() {
    const pathname = usePathname();

    // Hide sidebar on auth pages
    if (pathname === '/login' || pathname === '/register') {
        return null;
    }

    const isIComActive = pathname?.startsWith('/icom');
    const isIShowroomActive = !isIComActive && (pathname === '/' || pathname?.startsWith('/ishowroom'));

    const navItems = [
        {
            name: 'iShowroom',
            href: '/ishowroom',
            icon: 'storefront',
            isActive: isIShowroomActive,
        },
        {
            name: 'iCom',
            href: '/icom',
            icon: 'groups',
            isActive: isIComActive,
        },
    ];

    return (
        <aside className="hidden md:flex h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-slate-900 sticky top-0">
            {/* Logo Area */}
            <div className="flex h-16 items-center px-6 border-b border-gray-100 dark:border-gray-800">
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                    iManage
                </h1>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 space-y-2 p-4">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={clsx(
                            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                            item.isActive
                                ? "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 shadow-sm"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        )}
                    >
                        <span className={clsx(
                            "material-symbols-outlined text-[24px]",
                            item.isActive ? "fill-current" : ""
                        )}>
                            {item.icon}
                        </span>
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* User / Footer Area */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => logout()}
                    className="group flex w-full items-center gap-3 rounded-xl p-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                >
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-slate-700 group-hover:bg-red-100 dark:group-hover:bg-red-800 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-sm">logout</span>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">Logout</span>
                        <span className="text-[10px] text-gray-500 group-hover:text-red-400">Click to exit</span>
                    </div>
                </button>
            </div>
        </aside>
    );
}
