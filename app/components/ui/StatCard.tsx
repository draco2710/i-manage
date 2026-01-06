export function StatCard({ label, value, icon, colorClass }: { label: string; value: string | number; icon: string; colorClass: string }) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-icom-sm">
            <div className="flex items-center">
                <div className={`rounded-full p-3 ${colorClass.split(' ')[0]}`}>
                    <span className={`material-symbols-outlined text-2xl ${colorClass.split(' ')[1]}`}>
                        {icon}
                    </span>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
}
