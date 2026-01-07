'use client';

import { useIShop } from '@/features/icom/hooks/useIShop';
import { MemberForm } from '@/features/icom-members/components/MemberForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AddMemberRequest } from '@/features/icom/types/icom';

interface GlobalShopEditContainerProps {
    shopId: string;
}

export default function GlobalShopEditContainer({ shopId }: GlobalShopEditContainerProps) {
    const router = useRouter();
    const { data: member, isLoading, error, updateIShop } = useIShop(shopId);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error || !member) {
        return (
            <ErrorState
                title="Shop Not Found"
                message="Could not load shop information. please check the ID and try again."
                error={error || new Error('Shop not found')}
                reset={() => window.location.reload()}
            />
        );
    }

    const handleSubmit = async (data: AddMemberRequest) => {
        try {
            // "data" is actually AddMemberRequest shape (snake_case from onSubmitForm)
            // But UpdateIShopRequest is mostly compatible.
            // We just need to ensure correct mapping.

            await updateIShop.mutateAsync({
                name: data.name,
                industry: data.industry,
                sub_industry: data.sub_industry,
                province: data.province,
                district: data.district,
                ward: data.ward,
                street: data.street,
                lat: data.lat,
                lng: data.lng,
                phone: data.phone,
                email: data.email,
                website: data.website,
                description: data.description,
                status: data.status as any, // Cast status
                logo: data.logo,
                banner: data.banner,
            });

            toast.success('Shop updated successfully');
            // Hard refresh to ensure all caches clear
            window.location.reload();
        } catch (err) {
            toast.error('Failed to update shop');
        }
    };

    return (
        <div className="mx-auto max-w-4xl p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Edit Shop Profile</h1>
                <p className="text-gray-500">Global configuration for <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{shopId}</span></p>
            </div>

            <MemberForm
                initialData={member}
                mode="edit-shop"
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                isLoading={updateIShop.isPending}
            />
        </div>
    );
}
