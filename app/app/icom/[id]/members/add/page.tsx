import AddMemberContainer from '@/features/icom-members/components/AddMemberContainer';

interface PageProps {
    params: Promise<{ id: string }>;
}

/**
 * Server Component for Adding an iCom Member.
 */
export default async function AddMemberPage({ params }: PageProps) {
    const { id } = await params;

    return <AddMemberContainer icomId={id} />;
}
