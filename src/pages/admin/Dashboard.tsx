import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { Smartphone, Download, Activity, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Total Apps",
      value: stats.totalApps,
      change: "+12.5%",
      icon: Smartphone,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "1st Downloads",
      value: stats.totalDownloads.toLocaleString(),
      change: "+8.2%",
      icon: Download,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Downloads Today",
      value: stats.downloadsToday.toLocaleString(),
      change: "+4.1%",
      icon: Activity,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "Spare Versions",
      value: "28",
      change: "+13.5%",
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome, Admin</p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500 font-medium">{card.label}</span>
                <div className={`${card.bg} p-2 rounded-lg`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{card.value}</div>
              <div className="text-xs text-green-600 font-medium mt-1">{card.change} this week</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Downloads chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-1">Downloads Overview</h2>
            <p className="text-xs text-slate-400 mb-4">This Week</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.weeklyDownloads}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
                    }}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)' }}
                    labelStyle={{ color: '#0f172a', fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: '#22c55e' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top apps */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Top Apps</h2>
            <div className="space-y-3">
              {stats.recentDownloads?.slice(0, 5).map((dl, i) => (
                <div key={dl.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-slate-400 w-4 shrink-0">{i + 1}</span>
                    <span className="text-sm text-slate-700 truncate">{dl.appName}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500 shrink-0 ml-2">
                    v{dl.versionNumber}
                  </span>
                </div>
              ))}
              {!stats.recentDownloads?.length && (
                <p className="text-sm text-slate-400">No data available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent downloads table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Downloads</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">App</th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Version</th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Time</th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentDownloads?.map((dl) => (
                  <tr key={dl.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">{dl.appName}</td>
                    <td className="px-5 py-3 text-slate-500">v{dl.versionNumber}</td>
                    <td className="px-5 py-3 text-slate-400">
                      {new Date(dl.downloadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3 text-slate-400 font-mono text-xs">
                      {dl.userIp || '—'}
                    </td>
                  </tr>
                ))}
                {!stats.recentDownloads?.length && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400">No recent downloads</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
