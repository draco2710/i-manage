import { IComProfile, IComStats } from '../types/icom';

interface StatGridProps {
    icom: IComProfile;
    stats: IComStats | null;
}

/**
 * StatGrid component displays the key metrics for an iCom in a grid of gradient cards.
 */
export default function StatGrid({ icom, stats }: StatGridProps) {
    return (
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="overflow-hidden rounded-xl bg-gradient-to-br from-icom-teal to-teal-600 p-6 text-white shadow-icom-md">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-teal-100">Total Members</p>
                        <p className="mt-1 text-3xl font-bold">{icom.total_members}</p>
                    </div>
                    <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-2xl">groups</span>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-6 text-white shadow-icom-md">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100">Active Members</p>
                        <p className="mt-1 text-3xl font-bold">{icom.active_members || 0}</p>
                    </div>
                    <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-2xl">check_circle</span>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 p-6 text-white shadow-icom-md">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-purple-100">Industries</p>
                        <p className="mt-1 text-3xl font-bold">
                            {stats ? Object.keys(stats.industry_breakdown).length : 0}
                        </p>
                    </div>
                    <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-2xl">category</span>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 p-6 text-white shadow-icom-md">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-green-100">Growth</p>
                        <p className="mt-1 text-3xl font-bold flex items-center">
                            +12% <span className="material-symbols-outlined ml-1 text-sm">trending_up</span>
                        </p>
                    </div>
                    <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-2xl">monitoring</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
