import Link from 'next/link';
import { IComProfile } from '../types/icom';

interface IComHeroProps {
    id: string;
    icom: IComProfile;
}

/**
 * IComHero component displays the banner, logo, and title of an iCom.
 * It's typically used at the top of the iCom detail pages.
 */
export default function IComHero({ id, icom }: IComHeroProps) {
    return (
        <div className="relative h-64 w-full bg-gray-900">
            <div
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{
                    backgroundImage: icom.banner ? `url(${icom.banner})` : `linear-gradient(135deg, ${icom.theme_color || '#3B82F6'} 0%, #3B82F6 100%)`
                }}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 sm:p-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:text-left">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-6">
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg sm:-mb-12 sm:h-32 sm:w-32">
                            {icom.logo ? (
                                <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${icom.logo})` }} />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-icom-teal text-3xl font-bold text-white sm:text-4xl">
                                    {icom.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="text-white">
                            <h1 className="text-2xl font-bold sm:text-3xl">{icom.name}</h1>
                            <p className="text-sm text-gray-200 sm:text-base">{icom.full_name || icom.description}</p>
                        </div>
                    </div>
                    <div className="flex w-full gap-2 sm:mb-2 sm:w-auto sm:gap-3">
                        <Link
                            href={`/icom/${id}/edit`}
                            className="flex-1 rounded-lg bg-white/20 px-4 py-2 text-center text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30 sm:flex-none sm:text-left"
                        >
                            <span className="material-symbols-outlined mr-2 align-bottom text-lg">settings</span>
                            <span className="inline sm:hidden lg:inline">Settings</span>
                        </Link>
                        <Link
                            href={`/icom/${id}/members/add`}
                            className="flex-1 rounded-lg bg-icom-teal px-4 py-2 text-center text-sm font-medium text-white shadow-lg transition-colors hover:bg-icom-teal/90 sm:flex-none sm:text-left"
                        >
                            <span className="material-symbols-outlined mr-2 align-bottom text-lg">add</span>
                            <span className="inline sm:hidden lg:inline">Add Member</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
