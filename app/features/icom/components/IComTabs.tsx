'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

interface IComTabsProps {
    icomId: string;
}

/**
 * IComTabs component provides navigation for iCom detail pages.
 */
export default function IComTabs({ icomId }: IComTabsProps) {
    const pathname = usePathname();

    const tabs = [
        { name: 'Overview', href: `/icom/${icomId}`, exact: true },
        { name: 'Members', href: `/icom/${icomId}/members` },
        { name: 'Board', href: `/icom/${icomId}/board` },
        { name: 'Action Buttons', href: `/icom/${icomId}/actions` },
        { name: 'Leaderboard', href: `/icom/${icomId}/leaderboard` },
    ];

    return (
        <div className="no-scrollbar mb-8 overflow-x-auto border-b border-gray-200">
            <nav className="-mb-px flex min-w-max space-x-8">
                {tabs.map((tab) => {
                    const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={clsx(
                                'border-b-2 px-1 pb-4 text-sm font-medium transition-colors whitespace-nowrap',
                                isActive
                                    ? 'border-icom-teal text-icom-teal'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            )}
                        >
                            {tab.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
