'use client';

import IComHero from './IComHero';
import { useICom } from '../hooks/useICom';

interface IComHeroWrapperProps {
    id: string;
}

/**
 * Client-side wrapper for IComHero to consume iCom data from React Query.
 */
export default function IComHeroWrapper({ id }: IComHeroWrapperProps) {
    const { data: icom } = useICom(id);

    if (!icom) return null;

    return <IComHero id={id} icom={icom} />;
}
