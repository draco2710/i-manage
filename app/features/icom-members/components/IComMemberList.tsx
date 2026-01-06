'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMembers } from '../hooks/useMembers';
import { FilterMembersRequest, MemberSummary } from '@/features/icom/types/icom';
import { MemberFilters } from './MemberFilters';
import { MembersTable } from './MembersTable';

interface IComMemberListProps {
    icomId: string;
}

export function IComMemberList({ icomId }: IComMemberListProps) {
    const [activeFilters, setActiveFilters] = useState<FilterMembersRequest>({});

    // Fetch members and access removeMember mutation using the standardized hook
    const { data: membersData, isLoading, removeMember: deleteMutation } = useMembers(icomId, 1, 50, activeFilters);

    const members = membersData?.members || [];

    const handleFilterChange = (filters: FilterMembersRequest) => {
        setActiveFilters(filters);
    };

    const handleDelete = async (shopId: string) => {
        if (!confirm('Are you sure you want to remove this member from the community?')) return;
        deleteMutation.mutate(shopId);
    };

    const handleExport = () => {
        const headers = ['Shop ID', 'Name', 'Industry', 'Sub-Industry', 'Province', 'District', 'Rank', 'Status', 'Joined Date'];
        const rows = members.map(m => [
            m.shop_id, m.name, m.industry, m.sub_industry || '', m.province, m.district, m.rank || '', m.status || '', m.joined_date || ''
        ]);
        const csvContent = "data:text/csv;charset=utf-8," +
            [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `members_export_${icomId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* Local View Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6">
                <h2 className="text-xl font-bold text-gray-900">Members Management</h2>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleExport}
                        className="flex flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-none"
                    >
                        <span className="material-symbols-outlined mr-2 text-lg">download</span>
                        Export
                    </button>
                    <Link
                        href={`/icom/${icomId}/members/add`}
                        className="flex flex-1 items-center justify-center rounded-lg bg-icom-teal px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-600 transition-colors sm:flex-none"
                    >
                        <span className="material-symbols-outlined mr-2 text-lg">add_business</span>
                        Add Member
                    </Link>
                </div>
            </div>

            <MemberFilters onFilterChange={handleFilterChange} isLoading={isLoading} />
            <MembersTable
                members={members}
                onDelete={handleDelete}
                isLoading={isLoading || deleteMutation.isPending}
            />
        </div>
    );
}
