import useAdminMetrics from "@/features/admin/pages/components/dashboard/hooks/useAdminMetrics";

export default function AdminMetricsGrid() {
  const { metrics, loading, error } = useAdminMetrics();

  if (loading && !metrics) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
    {[1,2,3,4].map(i => <div key={i} className="h-32 bg-neutral-800 rounded-2xl border border-neutral-700"></div>)}
  </div>;

  if (error) return <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-8">{error}</div>;

  const stats = [
    { label: "Total Members", value: metrics?.total_members || 0, icon: "users", color: "blue" },
    { label: "Active Visits", value: metrics?.active_visits || 0, icon: "clock", color: "green" },
    { label: "Monthly Revenue", value: `Rp ${Number(metrics?.monthly_revenue || 0).toLocaleString('id-ID')}`, icon: "trending-up", color: "purple" },
    { label: "Active Trainers", value: metrics?.active_trainers || 0, icon: "star", color: "orange" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700 shadow-xl hover:border-neutral-600 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
              {/* Icon component normally goes here */}
              <div className="w-6 h-6 border-2 border-current rounded-md"></div>
            </div>
          </div>
          <p className="text-neutral-400 text-sm font-medium mb-1">{stat.label}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
        </div>
      ))}
    </div>
  );
}
