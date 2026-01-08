import Link from 'next/link';
import { IComProfile } from '../types/icom';

interface IComCardProps {
    icom: IComProfile;
}

/**
 * IComCard component displays a summary of an iCom community.
 * It's used in the community grid on the dashboard.
 */
export default function IComCard({ icom }: IComCardProps) {
    return (
        <Link
            href={`/icom/${icom.id}`}
            className="group overflow-hidden rounded-xl bg-white shadow-icom-sm transition-all hover:-translate-y-1 hover:shadow-icom-md"
        >
            {/* Banner with gradient overlay */}
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-icom-teal to-icom-blue">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={icom.banner ? { backgroundImage: `url(${icom.banner})` } : {}}
                />
                <div className="absolute inset-0 bg-black/10" />
                {/* Logo overlapping banner */}
                <div className="absolute -bottom-10 left-6">
                    <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center">
                        {icom.logo ? (
                            <div
                                className="h-full w-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${icom.logo})` }}
                            />
                        ) : (
                            <span className="text-2xl font-bold text-icom-teal">{icom.name.charAt(0)}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-12">
                <h3 className="text-xl font-bold text-gray-900">{icom.name}</h3>

                {/* Stats */}
                <div className="mt-4 flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-gray-600">
                        <span className="material-symbols-outlined mr-1 text-base">
                            group
                        </span>
                        <span>{icom.total_members || 0} members</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <span className="material-symbols-outlined mr-1 text-base">
                            check_circle
                        </span>
                        <span>{icom.active_members || 0} active</span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${icom.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {icom.status}
                    </span>
                </div>
            </div>
        </Link>
    );
}
