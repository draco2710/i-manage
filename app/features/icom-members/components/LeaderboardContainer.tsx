'use client';

import { useState } from 'react';
import { LeaderboardEntry } from '@/features/icom/types/icom';
import { clsx } from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '@/features/icom-members/api/members';

interface LeaderboardContainerProps {
    icomId: string;
}

export default function LeaderboardContainer({ icomId }: LeaderboardContainerProps) {
    const [activeTab, setActiveTab] = useState<'likes' | 'interactions'>('interactions');
    const [source, setSource] = useState<'all' | 'icom' | 'ishop'>('all');

    const { data, isLoading } = useQuery({
        queryKey: ['leaderboard', icomId, activeTab, source],
        queryFn: () => getLeaderboard(
            icomId,
            activeTab,
            10,
            source !== 'all' ? source : undefined
        ),
    });

    const entries = data?.entries || [];

    const handleTabChange = (tab: 'likes' | 'interactions') => {
        setActiveTab(tab);
        if (tab === 'interactions') {
            setSource('all'); // Interactions don't support source filtering yet
        }
    };

    return (
        <div className="space-y-6">
            {/* View Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Community Leaderboard</h2>
                    {activeTab === 'likes' && (
                        <div className="mt-3 flex gap-2">
                            {(['all', 'icom', 'ishop'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setSource(s)}
                                    className={clsx(
                                        "rounded-full px-3 py-1 text-xs font-semibold transition-all border",
                                        source === s
                                            ? "border-pink-200 bg-pink-50 text-pink-700"
                                            : "border-gray-200 bg-white text-gray-500 hover:border-pink-100 hover:text-pink-600"
                                    )}
                                >
                                    {s === 'all' ? 'All Sources' : s === 'icom' ? 'From iCom' : 'From iShop'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="inline-flex rounded-xl bg-gray-100 p-1 h-fit">
                    <button
                        onClick={() => handleTabChange('interactions')}
                        className={clsx(
                            "rounded-lg px-4 py-1.5 text-sm font-bold transition-all",
                            activeTab === 'interactions' ? "bg-white text-icom-teal shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Top Interactions
                    </button>
                    <button
                        onClick={() => handleTabChange('likes')}
                        className={clsx(
                            "rounded-lg px-4 py-1.5 text-sm font-bold transition-all",
                            activeTab === 'likes' ? "bg-white text-pink-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Most Liked
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-icom-teal border-t-transparent"></div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {entries.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-white rounded-xl shadow-icom-sm border border-dashed border-gray-200">
                            <span className="material-symbols-outlined mb-2 text-4xl text-gray-300">trophy</span>
                            <p className="text-gray-500">No data available yet.</p>
                        </div>
                    ) : (
                        entries.map((entry, index) => (
                            <div
                                key={entry.shop_id}
                                className={clsx(
                                    "relative flex items-center rounded-xl bg-white p-5 shadow-icom-sm transition-all hover:-translate-y-1 hover:shadow-icom-md border-l-4",
                                    index === 0 ? "border-yellow-400" : index === 1 ? "border-gray-300" : index === 2 ? "border-orange-300" : "border-gray-50"
                                )}
                            >
                                <div className={clsx(
                                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold shadow-inner",
                                    index === 0 ? "bg-yellow-50 text-yellow-600" :
                                        index === 1 ? "bg-gray-50 text-gray-600" :
                                            index === 2 ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-400"
                                )}>
                                    {index + 1}
                                </div>
                                <div className="ml-4 flex-1 overflow-hidden">
                                    <h3 className="font-bold text-gray-900 truncate">{entry.name}</h3>
                                    <p className="text-sm text-gray-500 font-medium">
                                        {entry.score.toLocaleString()} {activeTab === 'likes' ? 'Likes' : 'Interactions'}
                                    </p>
                                </div>
                                {index < 3 && (
                                    <div className="text-2xl drop-shadow-sm ml-2">
                                        {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
