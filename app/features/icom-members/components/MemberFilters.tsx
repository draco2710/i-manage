'use client';

import { useForm } from 'react-hook-form';
import { FilterMembersRequest } from '@/features/icom/types/icom';

interface MemberFiltersProps {
    onFilterChange: (filters: FilterMembersRequest) => void;
    industries?: string[]; // Optional preset options
    isLoading?: boolean;
}

export function MemberFilters({ onFilterChange, industries = [], isLoading }: MemberFiltersProps) {
    const { register, handleSubmit, watch } = useForm<FilterMembersRequest>();

    // Use debounced search in real implementation, simplified here
    const onSubmit = (data: FilterMembersRequest) => {
        // Clean up empty strings
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== '' && v !== 'ALL')
        );
        onFilterChange(cleanData);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-4 rounded-xl bg-white p-4 shadow-icom-sm">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Search */}
                <div className="relative col-span-full md:col-span-2 lg:col-span-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        search
                    </span>
                    <input
                        {...register('query')}
                        placeholder="Search by name, phone..."
                        className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-icom-teal focus:outline-none focus:ring-2 focus:ring-icom-teal/20"
                        onChange={handleSubmit(onSubmit)} // Auto-submit on change
                    />
                </div>

                {/* Industry Filter */}
                <div>
                    <select
                        {...register('industry')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-icom-teal focus:outline-none focus:ring-2 focus:ring-icom-teal/20"
                        onChange={handleSubmit(onSubmit)}
                    >
                        <option value="ALL">All Industries</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Technology">Technology</option>
                        <option value="Retail">Retail</option>
                        <option value="Services">Services</option>
                        <option value="Health">Health & Wellness</option>
                        {industries.map(ind => (
                            <option key={ind} value={ind}>{ind}</option>
                        ))}
                    </select>
                </div>

                {/* Rank Filter */}
                <div>
                    <select
                        {...register('rank')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-icom-teal focus:outline-none focus:ring-2 focus:ring-icom-teal/20"
                        onChange={handleSubmit(onSubmit)}
                    >
                        <option value="ALL">All Ranks</option>
                        <option value="PLATINUM">Platinum</option>
                        <option value="GOLD">Gold</option>
                        <option value="SILVER">Silver</option>
                        <option value="BRONZE">Bronze</option>
                    </select>
                </div>

                {/* Status Filter */}
                <div>
                    <select
                        {...register('status')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-icom-teal focus:outline-none focus:ring-2 focus:ring-icom-teal/20"
                        onChange={handleSubmit(onSubmit)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING">Pending</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
            </div>
        </form>
    );
}
