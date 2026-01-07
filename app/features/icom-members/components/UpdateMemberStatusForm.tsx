'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AddMemberRequest, MembershipDetail } from '@/features/icom/types/icom';
import { useEffect } from 'react';
import FormErrorMessage from '@/components/ui/FormErrorMessage';

const memberStatusSchema = z.object({
    rank: z.enum(['PLATINUM', 'GOLD', 'SILVER', 'BRONZE']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional(),
    role: z.string().optional(),
});

type MemberStatusFormData = z.infer<typeof memberStatusSchema>;

interface UpdateMemberStatusFormProps {
    initialData?: Partial<MembershipDetail>;
    onSubmit: (data: AddMemberRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function UpdateMemberStatusForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading,
}: UpdateMemberStatusFormProps) {

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<MemberStatusFormData>({
        resolver: zodResolver(memberStatusSchema),
        mode: 'onTouched',
        defaultValues: {
            rank: (initialData?.rank as any) || 'BRONZE',
            status: (initialData?.status as any) || 'ACTIVE',
            role: initialData?.role || '',
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                rank: (initialData.rank as any) || 'BRONZE',
                status: (initialData.status as any) || 'ACTIVE',
                role: initialData.role || '',
            });
        }
    }, [initialData, reset]);

    const onSubmitForm = (data: MemberStatusFormData) => {
        // We only care about rank, status, and role here.
        // The container will handle calling the correct API with just these fields.
        onSubmit(data as any);
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
            <div className="rounded-xl bg-white p-6 shadow-icom-sm">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Membership Status</h3>
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Rank</label>
                        <select
                            {...register('rank')}
                            className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                        >
                            <option value="PLATINUM">Platinum</option>
                            <option value="GOLD">Gold</option>
                            <option value="SILVER">Silver</option>
                            <option value="BRONZE">Bronze</option>
                        </select>
                        <FormErrorMessage message={errors.rank?.message} />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                        <select
                            {...register('status')}
                            className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                        <FormErrorMessage message={errors.status?.message} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700">Role in Community</label>
                        <input
                            {...register('role')}
                            placeholder="e.g. Founder, Member, etc."
                            className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                        />
                        <FormErrorMessage message={errors.role?.message} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl border border-gray-200 px-8 py-3.5 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative flex items-center justify-center rounded-xl bg-icom-teal px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-600 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                >
                    {isLoading ? (
                        <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined mr-2 text-lg">check_circle</span>
                            Update Status
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
