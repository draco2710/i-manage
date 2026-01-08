import GlobalShopEditContainer from '@/features/ishop/components/GlobalShopEditContainer';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function GlobalShopEditPage({ params }: PageProps) {
    const { id } = await params;

    return <GlobalShopEditContainer shopId={id} />;
}
