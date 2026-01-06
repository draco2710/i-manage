'use client';

import { useRouter } from 'next/navigation';
import { AddMemberRequest } from '@/features/icom/types/icom';
import { MemberForm } from '@/features/icom-members/components/MemberForm';
import { useMemberDetail } from '@/features/icom-members/hooks/useMemberDetail';

interface AddMemberContainerProps {
    icomId: string;
}

export default function AddMemberContainer({ icomId }: AddMemberContainerProps) {
    const router = useRouter();
    const { addMember } = useMemberDetail(icomId);

    const handleSubmit = async (data: AddMemberRequest) => {
        addMember.mutate(data, {
            onSuccess: () => router.push(`/icom/${icomId}/members`),
            onError: (err) => {
                console.error('Failed to add member:', err);
                // For demo/safety, navigate back
                router.push(`/icom/${icomId}/members`);
            }
        });
    };

    const handleCancel = () => {
        router.push(`/icom/${icomId}/members`);
    };

    return (
        <div className="space-y-6">
            {/* View Header */}
            <div className="border-b border-gray-100 pb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New iShop Member</h2>
            </div>

            <div className="mx-auto max-w-4xl">
                <MemberForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={addMember.isPending} />
            </div>
        </div>
    );
}
