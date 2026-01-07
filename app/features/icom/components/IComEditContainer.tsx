'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IComForm } from './IComForm';
import { useICom } from '../hooks/useICom';
import { useUpdateICom } from '../hooks/useUpdateICom';
import { useDeleteICom } from '../hooks/useDeleteICom';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface IComEditContainerProps {
    id: string;
}

/**
 * IComEditContainer orchestration component.
 * Manages fetching data, updating, and deleting an iCom community.
 */
export default function IComEditContainer({ id }: IComEditContainerProps) {
    const router = useRouter();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { data: icom, isLoading: isIComLoading, error: loadError } = useICom(id);
    const updateMutation = useUpdateICom(id);
    const deleteMutation = useDeleteICom(id);

    const handleSubmit = async (data: any) => {
        try {
            await updateMutation.mutateAsync(data);
            router.push(`/icom/${id}`);
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync();
            router.push('/icom');
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    if (isIComLoading && !icom) {
        return <LoadingSpinner fullScreen />;
    }

    if (!icom || loadError) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-8">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-lg bg-red-50 p-6 text-center">
                        <h3 className="text-lg font-bold text-red-800">Community Not Found</h3>
                        <Link href="/icom" className="mt-4 inline-block text-sm font-medium text-red-600 hover:text-red-800">
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center">
                        <Link
                            href={`/icom/${id}`}
                            className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition-colors hover:text-gray-900"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Community</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Update settings for {icom.name}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                    >
                        <span className="material-symbols-outlined mr-2 text-lg">delete</span>
                        Delete Community
                    </button>
                </div>

                {/* Status Notifications */}
                {updateMutation.isError && (
                    <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
                        <div className="flex">
                            <span className="material-symbols-outlined mr-2">error</span>
                            <p>Update failed. Please check your inputs and try again.</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <IComForm
                    initialData={icom}
                    onSubmit={handleSubmit}
                    isLoading={updateMutation.isPending}
                    isEdit={true}
                />
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <span className="material-symbols-outlined text-2xl">warning</span>
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-gray-900">Delete Community?</h3>
                        <p className="mb-6 text-sm text-gray-600">
                            Are you sure you want to delete <strong>{icom.name}</strong>? This action cannot be undone and will remove all associated members and data.
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70 order-1 sm:order-2"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
