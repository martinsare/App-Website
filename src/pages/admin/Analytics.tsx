import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useGetAnalyticsSummary,
  useGetDownloadsOverTime,
  useGetTopApps
} from "@workspace/api-client-react";
import { Download, Activity, CalendarDays, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GetDownloadsOverTimePeriod } from "@workspace/api-client-react";

export default function Analytics() {
  const [period, setPeriod] = useState<GetDownloadsOverTimePeriod>("month");

  const { data: summary } = useGetAnalyticsSummary();
  const { data: timeData } = useGetDownloadsOverTime({ period });
  const { data: topApps } = useGetTopApps();

  const statCards = [
    {
      label: "Total Downloads",
      value: summary?.totalDownloads.toLocaleString() || "0",
      change: "+16.8%",
      icon: Download,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Downloads Today",
      value: summary?.downloadsToday.toLocaleString() || "0",
      change: "+4.2%",
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Downloads This Week",
      value: summary?.downloadsThisWeek.toLocaleString() || "0",
      change: "+8.1%",
      icon: CalendarDays,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "Downloads This Month",
      value: summary?.downloadsThisMonth.toLocaleString() || "0",
      change: "+13.5%",
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-500 text-sm mt-0.5">Download statistics and trends</p>
          </div>
          <Select value={period} onValueChange={(v: GetDownloadsOverTimePeriod) => setPeriod(v)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{card.label}</span>
                <div className={`${card.bg} p-2 rounded-lg`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{card.value}</div>
              <div className="text-xs text-green-600 font-medium mt-1">{card.change} vs last period</div>
            </div>
          ))}
        </div>

        {/* Main chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Downloads Over Time</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return period === 'year'
                      ? `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`
                      : `${d.getMonth() + 1}/${d.getDate()}`;
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

        {/* Top apps + top versions */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Top Apps</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">#</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">App</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-400 uppercase text-right">Downloads</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-400 uppercase text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topApps?.slice(0, 5).map((app, i) => {
                  const totalDl = topApps.reduce((s, a) => s + (a.totalDownloads || 0), 0);
                  const pct = totalDl > 0 ? Math.round((app.totalDownloads || 0) / totalDl * 100) : 0;
                  return (
                    <tr key={app.appId || i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-slate-400 text-xs">{i + 1}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">{app.appName}</td>
                      <td className="px-5 py-3 text-slate-600 text-right">{app.totalDownloads?.toLocaleString()}</td>
                      <td className="px-5 py-3 text-slate-400 text-right text-xs">{pct}%</td>
                    </tr>
                  );
                })}
                {!topApps?.length && (
                  <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400 text-sm">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Top Versions</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">#</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">App</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Version</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-slate-400 uppercase text-right">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topApps?.slice(0, 5).map((app, i) => (
                  <tr key={`v-${app.appId || i}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">{app.appName}</td>
                    <td className="px-5 py-3 font-mono text-slate-500 text-xs">v{app.latestVersion}</td>
                    <td className="px-5 py-3 text-slate-600 text-right">{app.totalDownloads?.toLocaleString()}</td>
                  </tr>
                ))}
                {!topApps?.length && (
                  <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400 text-sm">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
