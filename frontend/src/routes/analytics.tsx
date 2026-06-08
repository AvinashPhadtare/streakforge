import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { Card, CardLabel } from "./dashboard";
import {
  HEATMAP_COLORS,
  categories,
  completionTrend,
  weekdayAvg,
  weeklyReports,
} from "@/lib/mock-data";
import { useDashboard } from "@/hooks/useApi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, LineChart, Line, CartesianGrid } from "recharts";
import { TrendingUp, Target, Trophy, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — StreakForge" }] }),
  component: () => (
    <AppLayout>
      <AnalyticsPage />
    </AppLayout>
  ),
});

function AnalyticsPage() {
  const { data: stats, isLoading } = useDashboard();
  const bestDay = [...weekdayAvg].sort((a, b) => b.pct - a.pct)[0];

  // Month grid
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const lead = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { d: number | null; v: number }[] = [];
  for (let i = 0; i < lead; i++) cells.push({ d: null, v: 0 });
  for (let d = 1; d <= daysInMonth; d++) {
    const seed = (d * 13 + month) % 6;
    cells.push({ d, v: d > today.getDate() ? 0 : seed });
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-neutral-400">Deep insights into your consistency.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ScoreCard
          icon={<Target className="h-4 w-4" />}
          label="Consistency"
          score={stats?.consistency ?? 0}
          color="#10b981"
          sub={`Current streak ${stats?.current_streak ?? 0} days`}
        />
        <ScoreCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Momentum"
          score={stats?.momentum ?? 0}
          color="#8b5cf6"
          sub={`Weekly completion ${stats?.completion_rate_this_week ?? 0}%`}
        />
        <ScoreCard
          icon={<Trophy className="h-4 w-4" />}
          label="Discipline"
          score={stats?.discipline ?? 0}
          color="#3b82f6"
          sub={`XP total ${stats?.total_xp ?? 0}`}
        />
        <Card>
          <CardLabel icon={<CalendarDays className="h-4 w-4 text-emerald" />} label="This Month" />
          <div className="mt-4 text-3xl font-bold">{stats?.active_days_month ?? stats?.activeDaysMonth ?? 0} / 30</div>
          <div className="text-xs text-neutral-400 mt-1">{stats?.active_rate_month ?? stats?.active_rate_this_month ?? 0}% active rate</div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold">Best Days of the Week</h3>
          <p className="mb-3 text-xs text-neutral-500">
            Your best day: <span className="text-emerald">{bestDay.day}</span>
          </p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={weekdayAvg} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="day" type="category" stroke="#525252" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                  {weekdayAvg.map((d, i) => (
                    <Cell key={i} fill={d.pct >= 80 ? "#10b981" : d.pct >= 60 ? "#22c55e" : d.pct >= 40 ? "#eab308" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Monthly Overview</h3>
            <span className="text-xs text-neutral-400">
              {today.toLocaleString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-neutral-500">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i}>{d}</div>
            ))}
            {cells.map((c, i) => (
              <div
                key={i}
                className="aspect-square rounded-md grid place-items-center text-xs"
                style={{ background: c.d == null ? "transparent" : HEATMAP_COLORS[c.v], color: c.v >= 3 ? "#04150f" : "#a3a3a3" }}
              >
                {c.d ?? ""}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Completion Rate — Last 30 Days</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={completionTrend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="date" stroke="#525252" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#525252" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="pct" stroke="#10b981" fill="url(#g1)" strokeWidth={2} />
                <Line type="monotone" dataKey="avg" stroke="#8b5cf6" strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Performance by Category</h3>
          <ul className="space-y-3">
            {categories.map((c) => (
              <li key={c.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-neutral-200">{c.icon} {c.name}</span>
                  <span className="text-neutral-400">{c.count} tasks · {c.rate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
                  <div
                    className="h-full"
                    style={{
                      width: `${c.rate}%`,
                      background: c.rate >= 80 ? "#10b981" : c.rate >= 60 ? "#22c55e" : "#eab308",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-semibold">Weekly Summaries</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                <th className="py-2 pr-3">Week</th>
                <th className="py-2 pr-3">Tasks</th>
                <th className="py-2 pr-3">Habits</th>
                <th className="py-2 pr-3">Avg %</th>
                <th className="py-2 pr-3">XP</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {weeklyReports.map((r) => (
                <tr key={r.week}>
                  <td className="py-3 pr-3 text-neutral-200">{r.week}</td>
                  <td className="py-3 pr-3 text-neutral-300">{r.tasks}</td>
                  <td className="py-3 pr-3 text-neutral-300">{r.habits}</td>
                  <td className="py-3 pr-3 text-neutral-300">{r.avg}%</td>
                  <td className="py-3 pr-3 text-violet-2">{r.xp}</td>
                  <td className="py-3 pr-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ScoreCard({ icon, label, score, color, sub }: { icon: React.ReactNode; label: string; score: number; color: string; sub: string }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <Card>
      <CardLabel icon={<span style={{ color }}>{icon}</span>} label={label} />
      <div className="mt-3 flex items-center gap-4">
        <svg width="78" height="78" viewBox="0 0 78 78">
          <circle cx="39" cy="39" r={r} stroke="#1f1f1f" strokeWidth="7" fill="none" />
          <circle cx="39" cy="39" r={r} stroke={color} strokeWidth="7" fill="none" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 39 39)" />
          <text x="39" y="44" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="700">{score}</text>
        </svg>
        <div className="text-xs text-neutral-400">{sub}</div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Perfect Week": "bg-emerald/15 text-emerald",
    "Good Week": "bg-yellow-500/15 text-yellow-400",
    "Needs Work": "bg-red-500/15 text-red-400",
  };
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${map[status]}`}>{status}</span>;
}
