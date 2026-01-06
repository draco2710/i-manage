'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AddActionRequest, ActionButton } from '@/features/icom/types/icom';
import { clsx } from 'clsx';
import FormErrorMessage from '@/components/ui/FormErrorMessage';

const actionSchema = z.object({
    type: z.enum(['zalo', 'facebook', 'messenger', 'website', 'phone', 'email', 'custom']),
    title: z.string().min(1, 'Title is required'),
    url: z.string().url('Invalid URL'),
    icon: z.string().optional(),
    order: z.coerce.number().optional().default(0),
});

type ActionFormData = z.infer<typeof actionSchema>;

interface ActionFormProps {
    initialData?: ActionButton;
    onSubmit: (data: AddActionRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    isEdit?: boolean;
}

const ACTION_TYPES = [
    { value: 'zalo', label: 'Zalo', icon: 'chat' },
    { value: 'facebook', label: 'Facebook', icon: 'facebook' },
    { value: 'messenger', label: 'Messenger', icon: 'chat_bubble' },
    { value: 'website', label: 'Website', icon: 'language' },
    { value: 'phone', label: 'Phone', icon: 'call' },
    { value: 'email', label: 'Email', icon: 'mail' },
    { value: 'custom', label: 'Custom', icon: 'star' },
];

export function ActionForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading,
    isEdit,
}: ActionFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ActionFormData>({
        resolver: zodResolver(actionSchema) as any,
        mode: 'onTouched',
        shouldFocusError: true,
        defaultValues: {
            type: (initialData?.type as any) || 'website',
            title: initialData?.title || '',
            url: initialData?.url || '',
            icon: initialData?.icon || '',
            order: initialData?.order || 0,
        },
    });

    const selectedType = watch('type');

    // Auto-fill title based on type if empty
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value;
        const typeObj = ACTION_TYPES.find(t => t.value === type);
        setValue('type', type as any);
        if (typeObj) {
            // Only set title if currently empty or matches another default
            setValue('title', typeObj.label);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Action Type <span className="text-red-500">*</span>
                </label>
                <select
                    {...register('type')}
                    onChange={handleTypeChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-icom-teal focus:outline-none focus:ring-2 focus:ring-icom-teal/10"
                >
                    {ACTION_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('title')}
                    className={clsx(
                        "w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2",
                        errors.title
                            ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-300 focus:border-icom-teal focus:ring-icom-teal/10"
                    )}
                    placeholder="e.g. Visit Website"
                />
                <FormErrorMessage message={errors.title?.message} />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    URL / Contact <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('url')}
                    className={clsx(
                        "w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2",
                        errors.url
                            ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-300 focus:border-icom-teal focus:ring-icom-teal/10"
                    )}
                    placeholder={selectedType === 'phone' ? 'e.g. tel:+84901234567' : selectedType === 'email' ? 'mailto:example@com' : 'https://example.com'}
                />
                <FormErrorMessage message={errors.url?.message} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Icon Class (Phosphor)</label>
                    <input
                        {...register('icon')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-icom-teal focus:outline-none focus:ring-2 focus:ring-icom-teal/10"
                        placeholder="e.g. ph-globe"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Display Order</label>
                    <input
                        type="number"
                        {...register('order')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-icom-teal focus:outline-none focus:ring-2 focus:ring-icom-teal/10"
                    />
                </div>
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
                    {isLoading ? 'Saving...' : isEdit ? 'Update Action' : 'Add Action'}
                </button>
            </div>
        </form>
    );
}
