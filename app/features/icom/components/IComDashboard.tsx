'use client';

import Link from 'next/link';
import { useIComs } from '../hooks/useIComs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatCard } from '@/components/ui/StatCard';
import IComCard from './IComCard';

/**
 * iCom Dashboard Component
 * 
 * Featured-Driven Design: This component lives within the icom feature
 * and uses the feature-specific useIComs hook and IComCard component.
 */
export default function IComDashboard() {
    // Use the custom hook from the feature folder
    const { data: icomsData, isLoading } = useIComs(1, 100);

    const icoms = icomsData?.icoms || [];

    // Calculate stats from the query data
    const stats = {
        totalCommunities: icomsData?.total || 0,
        totalMembers: icoms.reduce((acc, curr) => acc + (curr.total_members || 0), 0),
        activeMembers: icoms.reduce((acc, curr) => acc + (curr.active_members || 0), 0),
        growthRate: 12 // Mocked
    };

    if (isLoading && !icomsData) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Communities</h1>
                    <p className="mt-2 text-gray-600">
                        Manage your iCom communities and members
                    </p>
                </div>
                <Link
                    href="/icom/create"
                    className="inline-flex items-center rounded-lg bg-icom-gradient px-6 py-3 text-sm font-medium text-white shadow-icom-glow-teal transition-all hover:-translate-y-0.5 hover:shadow-icom-md"
                >
                    <span className="material-symbols-outlined mr-2">add</span>
                    Create New iCom
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Communities"
                    value={stats.totalCommunities}
                    icon="groups"
                    colorClass="bg-icom-teal/10 text-icom-teal"
                />
                <StatCard
                    label="Total Members"
                    value={stats.totalMembers}
                    icon="person"
                    colorClass="bg-icom-blue/10 text-icom-blue"
                />
                <StatCard
                    label="Active Members"
                    value={stats.activeMembers}
                    icon="check_circle"
                    colorClass="bg-icom-green/10 text-icom-green"
                />
                <StatCard
                    label="Growth Rate"
                    value={`+${stats.growthRate}%`}
                    icon="trending_up"
                    colorClass="bg-icom-purple/10 text-icom-purple"
                />
            </div>

            {/* iCom Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {icoms.map((icom) => (
                    <IComCard key={icom.id} icom={icom} />
                ))}
            </div>

            {/* Empty state when no iComs */}
            {icoms.length === 0 && (
                <div className="rounded-xl bg-white p-12 text-center shadow-icom-sm">
                    <span className="material-symbols-outlined mb-4 text-6xl text-gray-400">
                        groups
                    </span>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        No Communities Yet
                    </h3>
                    <p className="mb-6 text-gray-600">
                        Create your first iCom community to get started
                    </p>
                    <Link
                        href="/icom/create"
                        className="inline-flex items-center rounded-lg bg-icom-gradient px-6 py-3 text-sm font-medium text-white shadow-icom-glow-teal transition-all hover:-translate-y-0.5 hover:shadow-icom-md"
                    >
                        <span className="material-symbols-outlined mr-2">add</span>
                        Create New iCom
                    </Link>
                </div>
            )}
        </div>
    );
}
