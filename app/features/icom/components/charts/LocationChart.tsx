import { IComStats } from '../../types/icom';

interface LocationChartProps {
    stats: IComStats | null;
}

/**
 * LocationChart component displays member distribution across districts.
 */
export default function LocationChart({ stats }: LocationChartProps) {
    if (!stats) return null;

    const max = Math.max(...Object.values(stats.district_breakdown), 1);

    return (
        <div className="rounded-xl bg-white p-6 shadow-icom-sm">
            <h3 className="mb-6 text-lg font-bold text-gray-900">Location Distribution</h3>
            <div className="space-y-4">
                {Object.entries(stats.district_breakdown).map(([district, count], index) => {
                    const colors = ['bg-indigo-500', 'bg-pink-500', 'bg-yellow-500', 'bg-cyan-500'];
                    const percent = Math.round((count / max) * 100);
                    return (
                        <div key={district} className="flex items-center">
                            <span className="w-24 text-sm font-medium text-gray-700">{district}</span>
                            <div className="flex-1 px-3">
                                <div className="h-8 w-full rounded-md bg-gray-50">
                                    <div
                                        className={`h-full rounded-md ${colors[index % colors.length]} bg-opacity-80 transition-all hover:bg-opacity-100`}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                            <span className="w-8 text-sm text-gray-500">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
