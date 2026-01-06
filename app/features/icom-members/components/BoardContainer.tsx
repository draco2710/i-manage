'use client';

import { useState } from 'react';
import { BoardMember, AddBoardMemberRequest } from '@/features/icom/types/icom';
import { BoardMemberForm } from '@/features/icom-members/components/BoardMemberForm';
import { useBoardMembers } from '@/features/icom-members/hooks/useBoardMembers';

interface BoardContainerProps {
    icomId: string;
}

export default function BoardContainer({ icomId }: BoardContainerProps) {
    const {
        data: members = [],
        isLoading,
        addBoardMember,
        updateBoardMember,
        removeBoardMember
    } = useBoardMembers(icomId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<BoardMember | undefined>(undefined);

    const handleAddClick = () => {
        setEditingMember(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (member: BoardMember) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this board member?')) return;
        removeBoardMember.mutate(memberId);
    };

    const handleSubmit = async (data: AddBoardMemberRequest) => {
        if (editingMember) {
            updateBoardMember.mutate({ memberId: editingMember.memberId, data }, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            addBoardMember.mutate(data, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* View Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6">
                <h2 className="text-xl font-bold text-gray-900">Board Members Management</h2>
                <button
                    onClick={handleAddClick}
                    className="flex items-center justify-center rounded-lg bg-icom-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined mr-2">add</span>
                    Add Member
                </button>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-icom-teal border-t-transparent shadow-sm"></div>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {members.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-white rounded-xl shadow-icom-sm border border-dashed border-gray-200">
                            <span className="material-symbols-outlined mb-2 text-4xl text-gray-300">group_off</span>
                            <p className="text-gray-500">No board members yet. Add one to get started.</p>
                        </div>
                    ) : (
                        members.map((member) => (
                            <div key={member.memberId} className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-icom-sm transition-all hover:shadow-icom-md border border-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-icom-teal/10 text-xl font-bold text-icom-teal shadow-inner">
                                            {member.avatar ? (
                                                <img src={member.avatar} alt={member.name} className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                member.name.charAt(0)
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="font-bold text-gray-900">{member.name}</h3>
                                            <p className="text-sm font-medium text-icom-teal">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button
                                            onClick={() => handleEditClick(member)}
                                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(member.memberId)}
                                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
                                    {member.contact && (
                                        <div className="flex items-center mb-1">
                                            <span className="material-symbols-outlined mr-2 text-base">contact_mail</span>
                                            {member.contact}
                                        </div>
                                    )}
                                    {member.bio && (
                                        <p className="mt-2 line-clamp-2 italic">{member.bio}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">
                            {editingMember ? 'Edit Board Member' : 'Add Board Member'}
                        </h2>
                        <BoardMemberForm
                            initialData={editingMember}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsModalOpen(false)}
                            isLoading={addBoardMember.isPending || updateBoardMember.isPending}
                            isEdit={!!editingMember}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
