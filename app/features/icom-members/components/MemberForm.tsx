'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AddMemberRequest, MembershipDetail } from '@/features/icom/types/icom';
import { clsx } from 'clsx';
import { useState, useEffect } from 'react';

const memberSchema = z.object({
    name: z.string().min(3, 'Shop name must be at least 3 characters'),
    industry: z.string().min(1, 'Industry is required'),
    subIndustry: z.string().optional(),
    province: z.string().optional(),
    district: z.string().optional(),
    ward: z.string().optional(),
    street: z.string().optional(),
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    description: z.string().optional(),
    rank: z.enum(['PLATINUM', 'GOLD', 'SILVER', 'BRONZE']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional(),
    role: z.string().optional(),
    logo: z.string().optional(),
    banner: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
    initialData?: Partial<MembershipDetail> | Partial<IShopProfile>; // Allow IShopProfile too
    onSubmit: (data: AddMemberRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    mode?: 'create-member' | 'edit-shop'; // Default: 'create-member'
}

import FormErrorMessage from '@/components/ui/FormErrorMessage';
import { IShopProfile } from '@/features/icom/types/icom';

export function MemberForm({
    initialData: rawInitialData,
    onSubmit,
    onCancel,
    isLoading,
    mode = 'create-member',
}: MemberFormProps) {
    const [useMapPicker, setUseMapPicker] = useState(false); // Placeholder for map logic

    // Support both direct data and wrapped { data: { ... } }
    const initialData = rawInitialData;
    console.log('init: ', initialData);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<MemberFormData>({
        resolver: zodResolver(memberSchema) as any,
        mode: 'onTouched',
        shouldFocusError: true,
        defaultValues: {
            name: initialData?.name || '',
            industry: initialData?.industry || '',
            subIndustry: initialData?.sub_industry || '',
            province: initialData?.province || '',
            district: initialData?.district || '',
            ward: initialData?.ward || '',
            street: initialData?.street || '',
            lat: initialData?.lat ?? 0,
            lng: initialData?.lng ?? 0,
            phone: initialData?.phone || '',
            email: initialData?.email || '',
            website: initialData?.website || '',
            description: initialData?.description || '',
            rank: (initialData as any)?.rank || 'BRONZE',
            status: (initialData?.status as any) || 'ACTIVE',
            role: (initialData as any)?.role || '',
            logo: initialData?.logo || '',
            banner: initialData?.banner || '',
        },
    });

    // Reset form when initialData changes (handles async loading and SSR hydration)
    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name || '',
                industry: initialData.industry || '',
                subIndustry: initialData.sub_industry || '',
                province: initialData.province || '',
                district: initialData.district || '',
                ward: initialData.ward || '',
                street: initialData.street || '',
                lat: initialData.lat ?? 0,
                lng: initialData.lng ?? 0,
                phone: initialData.phone || '',
                email: initialData.email || '',
                website: initialData.website || '',
                description: initialData.description || '',
                rank: (initialData as any)?.rank || 'BRONZE',
                status: (initialData.status as any) || 'ACTIVE',
                role: (initialData as any)?.role || '',
                logo: initialData.logo || '',
                banner: initialData.banner || '',
            });
        }
    }, [initialData, reset]);

    const onSubmitForm = (data: MemberFormData) => {
        onSubmit({
            ...data,
            sub_industry: data.subIndustry,
        } as any); // Cast because AddMemberRequest expects snake_case but we're passing camelCase + our mapping
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
            {/* Section 1: Basic Info */}
            <div className="rounded-xl bg-white p-6 shadow-icom-sm">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Basic Information</h3>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-900">
                            Shop/Business Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('name')}
                            placeholder="Enter business name"
                            className={clsx(
                                "w-full rounded-lg border px-4 py-3 text-gray-900 transition-all focus:outline-none focus:ring-4",
                                errors.name
                                    ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-100"
                                    : "border-gray-200 focus:border-icom-teal focus:ring-icom-teal/10"
                            )}
                        />
                        <FormErrorMessage message={errors.name?.message} />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">
                            Industry <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('industry')}
                            className={clsx(
                                "w-full rounded-lg border px-4 py-3 text-gray-900 transition-all focus:outline-none focus:ring-4",
                                errors.industry
                                    ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-100"
                                    : "border-gray-200 focus:border-icom-teal focus:ring-icom-teal/10"
                            )}
                        >
                            <option value="">Select Industry</option>
                            <option value="food-beverage">Food & Beverage</option>
                            <option value="technology">Technology</option>
                            <option value="retail">Retail</option>
                            <option value="services">Services</option>
                            <option value="health-wellness">Health & Wellness</option>
                        </select>
                        <FormErrorMessage message={errors.industry?.message} />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">Sub-Industry</label>
                        <input
                            {...register('subIndustry')}
                            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                            placeholder="e.g. Specialty Coffee"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-900">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                            placeholder="Briefly describe the business"
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: Location */}
            <div className="rounded-xl bg-white p-6 shadow-icom-sm">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Location</h3>
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">Province/City</label>
                        <input
                            {...register('province')}
                            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">District</label>
                        <input
                            {...register('district')}
                            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">Ward</label>
                        <input
                            {...register('ward')}
                            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-900">Street Address</label>
                        <input
                            {...register('street')}
                            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                            placeholder="123 Street Name"
                        />
                    </div>

                    <div className="md:col-span-2 rounded-xl bg-gray-50 p-5 border border-gray-100">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="material-symbols-outlined mr-2 text-gray-400">location_on</span>
                                <h4 className="font-bold text-gray-900">Map Coordinates</h4>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                Coming Soon
                            </span>
                        </div>
                        <div className="flex space-x-6">
                            <div className="flex-1">
                                <label className="mb-1 block text-xs font-bold text-gray-900 uppercase tracking-wider">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    {...register('lat')}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 transition-all focus:border-icom-teal focus:outline-none focus:ring-2 focus:ring-icom-teal/10 font-mono"
                                />
                                <FormErrorMessage message={errors.lat?.message} />
                            </div>
                            <div className="flex-1">
                                <label className="mb-1 block text-xs font-bold text-gray-900 uppercase tracking-wider">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    {...register('lng')}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 transition-all focus:border-icom-teal focus:outline-none focus:ring-2 focus:ring-icom-teal/10 font-mono"
                                />
                                <FormErrorMessage message={errors.lng?.message} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Contact */}
            <div className="rounded-xl bg-white p-6 shadow-icom-sm">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Contact Details</h3>
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">Phone</label>
                        <input
                            {...register('phone')}
                            placeholder="e.g. 0912345678"
                            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">Email</label>
                        <input
                            {...register('email')}
                            placeholder="email@example.com"
                            className={clsx(
                                "w-full rounded-lg border px-4 py-3 text-gray-900 transition-all focus:outline-none focus:ring-4",
                                errors.email
                                    ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-100"
                                    : "border-gray-200 focus:border-icom-teal focus:ring-icom-teal/10"
                            )}
                        />
                        <FormErrorMessage message={errors.email?.message} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-900">Website</label>
                        <input
                            {...register('website')}
                            placeholder="https://example.com"
                            className={clsx(
                                "w-full rounded-lg border px-4 py-3 text-gray-900 transition-all focus:outline-none focus:ring-4",
                                errors.website
                                    ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-100"
                                    : "border-gray-200 focus:border-icom-teal focus:ring-icom-teal/10"
                            )}
                        />
                        <FormErrorMessage message={errors.website?.message} />
                    </div>
                </div>
            </div>

            {/* Section 4: Membership & Media */}
            <div className="rounded-xl bg-white p-6 shadow-icom-sm">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                    {mode === 'create-member' ? 'Membership & Media' : 'Media Assets'}
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                    {mode === 'create-member' && (
                        <>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-900">Rank</label>
                                <select
                                    {...register('rank')}
                                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                                >
                                    <option value="PLATINUM">Platinum</option>
                                    <option value="GOLD">Gold</option>
                                    <option value="SILVER">Silver</option>
                                    <option value="BRONZE">Bronze</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-900">Status</label>
                                <select
                                    {...register('status')}
                                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="SUSPENDED">Suspended</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-gray-900">Role in Community</label>
                                <input
                                    {...register('role')}
                                    placeholder="e.g. Founder, Member, etc."
                                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                                />
                            </div>
                        </>
                    )}

                    {/* Show Status in edit-shop mode but without rank/role */}
                    {mode === 'edit-shop' && (
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-900">Shop Status</label>
                            <select
                                {...register('status')}
                                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="SUSPENDED">Suspended</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">Logo URL</label>
                        <input
                            {...register('logo')}
                            placeholder="https://example.com/logo.png"
                            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900">Banner URL</label>
                        <input
                            {...register('banner')}
                            placeholder="https://example.com/banner.png"
                            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                        />
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
                            {mode === 'create-member' ? 'Add Member' : 'Update Shop'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
