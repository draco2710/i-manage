'use client';

import { MemberSummary } from '@/features/icom/types/icom';
import Link from 'next/link';

interface MembersTableProps {
    members: MemberSummary[];
    onDelete: (id: string) => void;
    isLoading?: boolean;
}

export function MembersTable({ members, onDelete, isLoading }: MembersTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-gray-100" />
                ))}
            </div>
        );
    }

    if (members.length === 0) {
        return (
            <div className="rounded-xl bg-white p-12 text-center text-gray-500 shadow-icom-sm">
                No members found matching your criteria.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-icom-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Member
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Industry
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Location
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Rank
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Status
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {members.map((member) => (
                            <tr key={member.shop_id} className="transition-colors hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            {member.logo ? (
                                                <img className="h-10 w-10 rounded-full object-cover" src={member.logo} alt="" />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-icom-teal/10 text-icom-teal font-bold">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <Link href={`./members/${member.shop_id}`} className="text-sm font-medium text-gray-900 hover:text-icom-teal transition-colors">
                                                {member.name}
                                            </Link>
                                            <div className="text-sm text-gray-500">ID: {member.shop_id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm text-gray-900">{member.industry}</div>
                                    <div className="text-xs text-gray-500">{member.sub_industry}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm text-gray-900">{member.district}</div>
                                    <div className="text-xs text-gray-500">{member.province}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {member.rank && (
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                        ${member.rank === 'PLATINUM' ? 'bg-slate-100 text-slate-800' :
                                                member.rank === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                                                    member.rank === 'SILVER' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-orange-100 text-orange-800' // Bronze
                                            }`}>
                                            {member.rank}
                                        </span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                     ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                            member.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                                                member.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {member.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-3">
                                        <Link href={`./members/${member.shop_id || (member as any).id}`} className="text-gray-400 hover:text-icom-teal transition-colors" title="View Detail">
                                            <span className="material-symbols-outlined text-xl">visibility</span>
                                        </Link>
                                        <Link href={`./members/${member.shop_id || (member as any).id}/edit`} className="text-gray-400 hover:text-icom-teal transition-colors" title="Edit Member">
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </Link>
                                        <button
                                            onClick={() => onDelete(member.shop_id || (member as any).id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                            title="Remove Member"
                                        >
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
