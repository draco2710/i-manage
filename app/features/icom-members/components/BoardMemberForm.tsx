'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AddBoardMemberRequest, BoardMember } from '@/features/icom/types/icom';
import { clsx } from 'clsx';
import FormErrorMessage from '@/components/ui/FormErrorMessage';

const boardMemberSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.string().min(2, 'Role is required'),
    contact: z.string().optional(),
    bio: z.string().optional(),
    avatar: z.string().optional(), // In real app, this would be a file upload
});

type BoardMemberFormData = z.infer<typeof boardMemberSchema>;

interface BoardMemberFormProps {
    initialData?: BoardMember;
    onSubmit: (data: AddBoardMemberRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    isEdit?: boolean;
}

export function BoardMemberForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading,
    isEdit,
}: BoardMemberFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<BoardMemberFormData>({
        resolver: zodResolver(boardMemberSchema) as any,
        mode: 'onTouched',
        shouldFocusError: true,
        defaultValues: {
            name: initialData?.name || '',
            role: initialData?.role || '',
            contact: initialData?.contact || '',
            bio: initialData?.bio || '',
            avatar: initialData?.avatar || '',
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('name')}
                    className={clsx(
                        "w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2",
                        errors.name
                            ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-300 focus:border-icom-teal focus:ring-icom-teal/10"
                    )}
                    placeholder="e.g. Nguyen Van A"
                />
                <FormErrorMessage message={errors.name?.message} />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Role/Position <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('role')}
                    className={clsx(
                        "w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2",
                        errors.role
                            ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-300 focus:border-icom-teal focus:ring-icom-teal/10"
                    )}
                    placeholder="e.g. President"
                />
                <FormErrorMessage message={errors.role?.message} />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Contact Info</label>
                <input
                    {...register('contact')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-icom-teal focus:outline-none focus:ring-2 focus:ring-icom-teal/10"
                    placeholder="Email or Phone"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Bio (Optional)</label>
                <textarea
                    {...register('bio')}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-icom-teal focus:outline-none focus:ring-2 focus:ring-icom-teal/10"
                    placeholder="Short biography..."
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-lg bg-icom-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-70"
                >
                    {isLoading ? 'Saving...' : isEdit ? 'Update Member' : 'Add Member'}
                </button>
            </div>
        </form>
    );
}
