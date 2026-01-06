'use client';

import { useState } from 'react';
import { ActionButton, AddActionRequest } from '@/features/icom/types/icom';
import { ActionForm } from '@/features/icom-members/components/ActionForm';
import { useActions } from '@/features/icom-members/hooks/useActions';

interface ActionsContainerProps {
    icomId: string;
}

export default function ActionsContainer({ icomId }: ActionsContainerProps) {
    const {
        data: actions = [],
        isLoading,
        addAction,
        updateAction,
        removeAction
    } = useActions(icomId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAction, setEditingAction] = useState<ActionButton | undefined>(undefined);

    const handleAddClick = () => {
        setEditingAction(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (action: ActionButton) => {
        setEditingAction(action);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (actionId: string) => {
        if (!confirm('Are you sure you want to remove this action?')) return;
        removeAction.mutate(actionId);
    };

    const handleSubmit = async (data: AddActionRequest) => {
        if (editingAction) {
            updateAction.mutate({ actionId: editingAction.actionId, data }, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            addAction.mutate(data, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'zalo': return 'chat';
            case 'facebook': return 'facebook';
            case 'messenger': return 'chat_bubble';
            case 'website': return 'language';
            case 'phone': return 'call';
            case 'email': return 'mail';
            default: return 'star'; // Custom
        }
    };

    return (
        <div className="space-y-6">
            {/* View Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6">
                <h2 className="text-xl font-bold text-gray-900">Action Buttons Management</h2>
                <button
                    onClick={handleAddClick}
                    className="flex items-center justify-center rounded-lg bg-icom-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined mr-2 text-lg">add</span>
                    Add Action
                </button>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-icom-teal border-t-transparent shadow-sm"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {actions.length === 0 ? (
                        <div className="py-12 text-center bg-white rounded-xl shadow-icom-sm border border-dashed border-gray-200">
                            <span className="material-symbols-outlined mb-2 text-4xl text-gray-300">touch_app</span>
                            <p className="text-gray-500">No action buttons configured yet.</p>
                        </div>
                    ) : (
                        actions.map((action) => (
                            <div key={action.actionId} className="flex items-center justify-between rounded-xl bg-white p-5 shadow-icom-sm transition-all hover:shadow-icom-md border border-gray-50">
                                <div className="flex items-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-icom-blue/10 text-icom-blue shadow-inner">
                                        <span className="material-symbols-outlined text-2xl shadow-sm">
                                            {action.icon || getIconForType(action.type)}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-bold text-gray-900">{action.title}</h3>
                                        <p className="text-sm text-gray-500 font-mono mt-0.5">{action.url}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="mr-6 hidden text-xs font-bold text-gray-400 uppercase tracking-wider sm:block bg-gray-50 px-2 py-1 rounded shadow-inner">
                                        Order: {action.order}
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => handleEditClick(action)}
                                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(action.actionId)}
                                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    </div>
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
                            {editingAction ? 'Edit Action Button' : 'Add Action Button'}
                        </h2>
                        <ActionForm
                            initialData={editingAction}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsModalOpen(false)}
                            isLoading={addAction.isPending || updateAction.isPending}
                            isEdit={!!editingAction}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
