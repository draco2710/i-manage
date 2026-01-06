import { IComStats } from '../../types/icom';

interface IndustryChartProps {
    stats: IComStats | null;
    totalMembers: number;
}

/**
 * IndustryChart component displays a breakdown of members by industry.
 * Uses CSS linear-gradient bars for visualization.
 */
export default function IndustryChart({ stats, totalMembers }: IndustryChartProps) {
    if (!stats) return null;

    return (
        <div className="rounded-xl bg-white p-6 shadow-icom-sm">
            <h3 className="mb-6 text-lg font-bold text-gray-900">Industry Breakdown</h3>
            <div className="space-y-4">
                {Object.entries(stats.industry_breakdown).map(([industry, count], index) => {
                    const colors = ['bg-icom-teal', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'];
                    const percent = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;
                    return (
                        <div key={industry}>
                            <div className="mb-1 flex justify-between text-sm">
                                <span className="font-medium text-gray-700">{industry}</span>
                                <span className="text-gray-500">{count} ({percent}%)</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className={`h-full rounded-full ${colors[index % colors.length]}`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
