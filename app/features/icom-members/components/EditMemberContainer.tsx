'use client';

import { useRouter } from 'next/navigation';
import { AddMemberRequest } from '@/features/icom/types/icom';
import { UpdateMemberStatusForm } from '@/features/icom-members/components/UpdateMemberStatusForm';
import { useMemberDetail } from '@/features/icom-members/hooks/useMemberDetail';

interface EditMemberContainerProps {
    icomId: string;
    shopId: string;
    member: any;
}

export default function EditMemberContainer({ icomId, shopId, member: initialMember }: EditMemberContainerProps) {
    const router = useRouter();
    const { data: memberData, updateStatus } = useMemberDetail(icomId, shopId);

    // Prefer data from hook (hydrated/fresh), fallback to initialMember from prop
    const member = memberData || initialMember;

    const handleSubmit = async (data: AddMemberRequest) => {
        try {
            await updateStatus.mutateAsync({
                status: data.status,
                rank: data.rank,
                role: data.role
            });

            router.push(`/icom/${icomId}/members`);
        } catch (err) {
            console.error('Failed to update member status:', err);
            router.push(`/icom/${icomId}/members`);
        }
    };

    const handleCancel = () => {
        router.push(`/icom/${icomId}/members`);
    };

    return (
        <div className="space-y-6">
            {/* View Header */}
            <div className="border-b border-gray-100 pb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Member Status: {member.name}</h2>
            </div>

            <div className="mx-auto max-w-4xl">
                <UpdateMemberStatusForm
                    initialData={member}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={updateStatus.isPending}
                />
            </div>
        </div>
    );
}
