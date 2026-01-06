'use client';

import { useRouter } from 'next/navigation';
import { IComForm } from './IComForm';
import { useCreateICom } from '../hooks/useCreateICom';
import { CreateIComRequest } from '../types/icom';

/**
 * IComCreateContainer orchestration component.
 * Manages the creation flow for a new iCom.
 */
export default function IComCreateContainer() {
    const router = useRouter();
    const { mutateAsync: createICom, isPending, isError } = useCreateICom();

    const handleSubmit = async (data: CreateIComRequest) => {
        try {
            const newICom = await createICom(data);
            router.push(`/icom/${newICom.id}`);
        } catch (err) {
            console.error('Failed to create iCom:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create New Community</h1>
                    <p className="mt-2 text-gray-500">
                        Follow the steps to set up your new iCom community profile.
                    </p>
                </div>

                {/* Error status */}
                {isError && (
                    <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
                        <div className="flex">
                            <span className="material-symbols-outlined mr-2">error</span>
                            <p>Creation failed. Please check your data and try again.</p>
                        </div>
                    </div>
                )}

                <IComForm
                    onSubmit={handleSubmit}
                    isLoading={isPending}
                    isEdit={false}
                />
            </div>
        </div>
    );
}
