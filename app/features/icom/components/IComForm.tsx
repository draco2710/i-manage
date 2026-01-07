'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormErrorMessage from '@/components/ui/FormErrorMessage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import Link from 'next/link';
import { CreateIComRequest, IComProfile } from '../types/icom';

// Utility for merging tailwind classes
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Form Schema
const iComSchema = z.object({
    name: z.string().min(3, 'Community name must be at least 3 characters'),
    fullName: z.string().default(''),
    slogan: z.string().default(''),
    description: z.string().default(''),
    logo: z.string().default(''),
    banner: z.string().default(''),
    themeColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid hex color code').default('#14B8A6'),
    address: z.string().default(''),
    phone: z.string().default(''),
    email: z.string().email('Invalid email address').or(z.literal('')).default(''),
    website: z.string().url('Invalid URL').or(z.literal('')).default(''),
    maxMembers: z.coerce.number().min(1, 'Must allow at least 1 member').default(100),
    requireApproval: z.boolean().default(false),
    autoActivate: z.boolean().default(true),
});

type IComFormData = z.infer<typeof iComSchema>;

interface IComFormProps {
    initialData?: Partial<IComProfile>;
    onSubmit: (data: CreateIComRequest) => Promise<void>;
    isLoading?: boolean;
    isEdit?: boolean;
}

const STEPS = [
    { id: 'profile', title: 'Profile' },
    { id: 'settings', title: 'Settings' },
    { id: 'contact', title: 'Contact' },
    { id: 'review', title: 'Review' },
];

export function IComForm({ initialData, onSubmit, isLoading, isEdit }: IComFormProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const form = useForm<IComFormData>({
        resolver: zodResolver(iComSchema) as any,
        defaultValues: {
            name: initialData?.name || '',
            fullName: initialData?.full_name || '',
            slogan: initialData?.slogan || '',
            description: initialData?.description || '',
            logo: initialData?.logo || '',
            banner: initialData?.banner || '',
            themeColor: initialData?.theme_color || '#14B8A6',
            address: initialData?.address || '',
            phone: initialData?.phone || '',
            email: initialData?.email || '',
            website: initialData?.website || '',
            maxMembers: initialData?.max_members || 100,
            requireApproval: initialData?.require_approval === 'true',
            autoActivate: initialData?.auto_activate !== 'false', // Default true
        },
        mode: 'onTouched',
        shouldFocusError: true,
    });

    const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState: { errors, isValid },
    } = form;

    // Watch values for preview
    const watchedValues = watch();

    const handleNext = async () => {
        let fieldsToValidate: (keyof IComFormData)[] = [];

        if (currentStep === 0) {
            fieldsToValidate = ['name', 'fullName', 'slogan', 'description', 'themeColor'];
        } else if (currentStep === 1) {
            fieldsToValidate = ['maxMembers'];
        } else if (currentStep === 2) {
            fieldsToValidate = ['email', 'website', 'phone'];
        }

        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const onSubmitForm = (data: IComFormData) => {
        onSubmit({
            name: data.name,
            full_name: data.fullName,
            slogan: data.slogan,
            description: data.description,
            logo: data.logo,
            banner: data.banner,
            theme_color: data.themeColor,
            address: data.address,
            phone: data.phone,
            email: data.email,
            website: data.website,
            max_members: data.maxMembers,
            require_approval: data.requireApproval,
            auto_activate: data.autoActivate,
            // Clean up empty optional fields if needed
        });
    };

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column: Form Wizard */}
            <div className="lg:col-span-2">
                <div className="rounded-2xl bg-white p-8 shadow-icom-md">
                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            {STEPS.map((step, index) => {
                                const isActive = index === currentStep;
                                const isCompleted = index < currentStep;

                                return (
                                    <div key={step.id} className="flex flex-1 items-center">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={cn(
                                                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all',
                                                    isActive
                                                        ? 'bg-icom-teal text-white shadow-icom-glow-teal'
                                                        : isCompleted
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-gray-200 text-gray-500'
                                                )}
                                            >
                                                {isCompleted ? (
                                                    <span className="material-symbols-outlined text-base">check</span>
                                                ) : (
                                                    index + 1
                                                )}
                                            </div>
                                            <span
                                                className={cn(
                                                    'mt-2 text-xs font-medium',
                                                    isActive ? 'text-icom-teal' : 'text-gray-500'
                                                )}
                                            >
                                                {step.title}
                                            </span>
                                        </div>
                                        {index < STEPS.length - 1 && (
                                            <div
                                                className={cn(
                                                    'mx-2 h-[2px] flex-1',
                                                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                                                )}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmitForm)}>
                        {/* Step 1: Profile */}
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Profile Information</h3>
                                    <p className="text-sm text-gray-500">Basic details about your community</p>
                                </div>

                                {/* Banner Upload Mock */}
                                <div
                                    className="relative flex h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100"
                                    style={{
                                        background: watchedValues.banner
                                            ? `url(${watchedValues.banner}) center/cover`
                                            : undefined,
                                    }}
                                >
                                    {!watchedValues.banner && (
                                        <div className="text-center">
                                            <span className="material-symbols-outlined text-4xl text-gray-400">image</span>
                                            <p className="mt-1 text-sm text-gray-500">Upload Banner</p>
                                        </div>
                                    )}
                                    {/* Hidden input for real implementation */}
                                    <input type="hidden" {...register('banner')} />
                                </div>

                                {/* Logo Upload Mock */}
                                <div className="-mt-10 ml-6 flex items-end space-x-4">
                                    <div
                                        className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-md"
                                        style={{
                                            background: watchedValues.logo
                                                ? `url(${watchedValues.logo}) center/cover`
                                                : undefined,
                                            backgroundColor: watchedValues.themeColor,
                                        }}
                                    >
                                        {!watchedValues.logo && (
                                            <span className="material-symbols-outlined text-3xl text-white/50">
                                                add_a_photo
                                            </span>
                                        )}
                                        <input type="hidden" {...register('logo')} />
                                    </div>
                                </div>

                                <div className="grid gap-6">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Community Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register('name')}
                                            className={cn(
                                                "w-full rounded-lg border px-4 py-3 transition-all focus:outline-none focus:ring-4",
                                                errors.name
                                                    ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-100"
                                                    : "border-gray-200 focus:border-icom-teal focus:ring-icom-teal/10"
                                            )}
                                            placeholder="e.g. BNI Win Win"
                                        />
                                        <FormErrorMessage message={errors.name?.message} />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Full Name (Optional)
                                        </label>
                                        <input
                                            {...register('fullName')}
                                            className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                                            placeholder="e.g. BNI Win Win Chapter Hanoi"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Slogan
                                        </label>
                                        <input
                                            {...register('slogan')}
                                            className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                                            placeholder="e.g. Givers Gain"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            {...register('description')}
                                            rows={4}
                                            className="w-full rounded-lg border border-gray-200 px-4 py-3 transition-all focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                                            placeholder="Describe your community..."
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Theme Color
                                        </label>
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="color"
                                                {...register('themeColor')}
                                                className="h-10 w-20 cursor-pointer rounded border p-1"
                                            />
                                            <span className="text-sm text-gray-500">{watchedValues.themeColor}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Settings */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Community Settings</h3>
                                    <p className="text-sm text-gray-500">Configure rules and limits</p>
                                </div>

                                <div className="space-y-4 rounded-lg border border-gray-200 p-6">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Max Members <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            {...register('maxMembers')}
                                            className={cn(
                                                "w-full rounded-lg border px-4 py-3 transition-all focus:outline-none focus:ring-4",
                                                errors.maxMembers
                                                    ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-100"
                                                    : "border-gray-200 focus:border-icom-teal focus:ring-icom-teal/10"
                                            )}
                                        />
                                        <FormErrorMessage message={errors.maxMembers?.message} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900">
                                                Require Approval
                                            </label>
                                            <p className="text-sm text-gray-500">
                                                New members must be approved by admin
                                            </p>
                                        </div>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input
                                                type="checkbox"
                                                {...register('requireApproval')}
                                                className="peer sr-only"
                                            />
                                            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-icom-teal peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-icom-teal/20"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900">
                                                Auto Activate
                                            </label>
                                            <p className="text-sm text-gray-500">
                                                Automatically activate iShops created in this community
                                            </p>
                                        </div>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input
                                                type="checkbox"
                                                {...register('autoActivate')}
                                                className="peer sr-only"
                                            />
                                            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-icom-teal peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-icom-teal/20"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Contact */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
                                    <p className="text-sm text-gray-500">How people can reach this community</p>
                                </div>

                                <div className="grid gap-6">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Address</label>
                                        <input
                                            {...register('address')}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                                            placeholder="123 Main St, City"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Phone</label>
                                        <input
                                            {...register('phone')}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-icom-teal focus:outline-none focus:ring-4 focus:ring-icom-teal/10"
                                            placeholder="+84 901 234 567"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            {...register('email')}
                                            className={cn(
                                                "w-full rounded-lg border px-4 py-3 transition-all focus:outline-none focus:ring-4",
                                                errors.email
                                                    ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-100"
                                                    : "border-gray-200 focus:border-icom-teal focus:ring-icom-teal/10"
                                            )}
                                            placeholder="contact@example.com"
                                        />
                                        <FormErrorMessage message={errors.email?.message} />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Website</label>
                                        <input
                                            {...register('website')}
                                            className={cn(
                                                "w-full rounded-lg border px-4 py-3 transition-all focus:outline-none focus:ring-4",
                                                errors.website
                                                    ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-100"
                                                    : "border-gray-200 focus:border-icom-teal focus:ring-icom-teal/10"
                                            )}
                                            placeholder="https://example.com"
                                        />
                                        <FormErrorMessage message={errors.website?.message} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Review {isEdit ? 'Changes' : '& Create'}</h3>
                                    <p className="text-sm text-gray-500">
                                        Please verify all information below before {isEdit ? 'saving' : 'creating'} your community.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid gap-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Basic Info</h4>
                                            <div className="mt-2 space-y-1">
                                                <p className="text-sm font-semibold text-gray-900">{watchedValues.name}</p>
                                                {watchedValues.fullName && <p className="text-xs text-gray-500">{watchedValues.fullName}</p>}
                                                {watchedValues.slogan && <p className="text-xs italic text-icom-teal">"{watchedValues.slogan}"</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Settings</h4>
                                            <div className="mt-2 space-y-1 text-sm">
                                                <div className="flex items-center text-gray-700">
                                                    <span className="material-symbols-outlined mr-1 text-base">group</span>
                                                    Max {watchedValues.maxMembers}
                                                </div>
                                                <div className="flex items-center text-gray-700">
                                                    <span className={`material-symbols-outlined mr-1 text-base ${watchedValues.requireApproval ? 'text-amber-500' : 'text-green-500'}`}>
                                                        {watchedValues.requireApproval ? 'lock' : 'lock_open'}
                                                    </span>
                                                    {watchedValues.requireApproval ? 'Requires Approval' : 'Open Access'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Contact & Location</h4>
                                            <div className="mt-2 grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-1 text-sm text-gray-700">
                                                    {watchedValues.email && (
                                                        <div className="flex items-center"><span className="material-symbols-outlined mr-1 text-base">mail</span>{watchedValues.email}</div>
                                                    )}
                                                    {watchedValues.phone && (
                                                        <div className="flex items-center"><span className="material-symbols-outlined mr-1 text-base">phone</span>{watchedValues.phone}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-1 text-sm text-gray-700">
                                                    {watchedValues.website && (
                                                        <div className="flex items-center"><span className="material-symbols-outlined mr-1 text-base">language</span>{watchedValues.website}</div>
                                                    )}
                                                    {watchedValues.address && (
                                                        <div className="flex items-center"><span className="material-symbols-outlined mr-1 text-base">location_on</span>{watchedValues.address}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Explicit Confirmation Checkbox */}
                                    <div className="rounded-xl border border-icom-teal/20 bg-icom-teal/5 p-4">
                                        <label className="flex cursor-pointer items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={isConfirmed}
                                                onChange={(e) => setIsConfirmed(e.target.checked)}
                                                className="mt-1 h-5 w-5 rounded border-gray-300 text-icom-teal focus:ring-icom-teal"
                                            />
                                            <div className="text-sm">
                                                <span className="font-bold text-gray-900">Confirm and {isEdit ? 'Save' : 'Create'}</span>
                                                <p className="text-gray-600">
                                                    I have reviewed all the information and confirm it is accurate.
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className={cn(
                                    'flex items-center rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50',
                                    currentStep === 0 && 'invisible'
                                )}
                            >
                                Back
                            </button>

                            {currentStep < STEPS.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex items-center rounded-lg bg-icom-gradient px-8 py-2.5 text-sm font-bold text-white shadow-icom-glow-teal transition-all hover:-translate-y-0.5 hover:shadow-icom-md"
                                >
                                    Next Step
                                    <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isLoading || !isConfirmed}
                                    className="flex items-center rounded-lg bg-icom-gradient px-8 py-2.5 text-sm font-bold text-white shadow-icom-glow-teal transition-all hover:-translate-y-0.5 hover:shadow-icom-md disabled:opacity-50 disabled:grayscale disabled:hover:translate-y-0"
                                >
                                    {isLoading ? (isEdit ? 'Saving...' : 'Creating...') : isEdit ? 'Save Changes' : 'Create Community'}
                                    {!isLoading && (
                                        <span className="material-symbols-outlined ml-2 text-sm">check</span>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Preview */}
            <div className="hidden lg:block">
                <div className="sticky top-8">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">Live Preview</h3>

                    {/* Card Preview */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-icom-md">
                        {/* Banner */}
                        <div
                            className="relative h-40 bg-gray-100"
                            style={{
                                background: watchedValues.banner
                                    ? `url(${watchedValues.banner}) center/cover`
                                    : `linear-gradient(135deg, ${watchedValues.themeColor}40 0%, ${watchedValues.themeColor}80 100%)`, // Fallback gradient based on theme
                            }}
                        >
                            <div className="absolute inset-0 bg-black/5" />
                        </div>

                        {/* Content */}
                        <div className="relative px-6 pb-6 pt-12">
                            {/* Logo */}
                            <div className="absolute -top-10 left-6">
                                <div
                                    className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md"
                                    style={{
                                        backgroundColor: watchedValues.themeColor
                                    }}
                                >
                                    {watchedValues.logo ? (
                                        <div
                                            className="h-full w-full"
                                            style={{ background: `url(${watchedValues.logo}) center/cover` }}
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-white">
                                            {watchedValues.name?.charAt(0) || 'C'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Text info */}
                            <h3 className="text-xl font-bold text-gray-900">
                                {watchedValues.name || 'Community Name'}
                            </h3>
                            {watchedValues.slogan && (
                                <p className="mt-1 text-sm text-icom-teal">{watchedValues.slogan}</p>
                            )}

                            <div className="mt-4 flex space-x-4 border-t border-gray-100 pt-4">
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">0</p>
                                    <p className="text-xs text-gray-500">Members</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">0</p>
                                    <p className="text-xs text-gray-500">Active</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    className="w-full rounded-lg py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
                                    style={{ background: watchedValues.themeColor }}
                                >
                                    Join Community
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                        <div className="flex">
                            <span className="material-symbols-outlined mr-2">info</span>
                            <p>
                                This preview shows how your community card will appear to users in the directory.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
