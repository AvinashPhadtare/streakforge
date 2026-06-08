import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { Heatmap } from "@/components/heatmap";
import { weeklyTrend } from "@/lib/mock-data";
import { Flame, Zap, CheckCircle2, Calendar } from "lucide-react";
import { useDashboard, useStreak, useXP, useTasks, useCompleteTask } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — StreakForge" }] }),
  component: () => (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  ),
});

function DashboardPage() {
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard();
  const { data: streak, isLoading: streakLoading } = useStreak();
  const { data: xp, isLoading: xpLoading } = useXP();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const completeTask = useCompleteTask();
  const avg = weeklyTrend.reduce((s, w) => s + w.pct, 0) / weeklyTrend.length;

  if (dashboardLoading || streakLoading || xpLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-36" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const todayTasks = tasks?.slice(0, 5) || [];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-400">Welcome back. Keep the streak alive.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Flame className="h-4 w-4 text-emerald" />}
          label="Day Streak 🔥"
          value={String(streak?.current_streak || 0)}
          sub={`Best: ${streak?.best_streak || 0} days`}
        />
        <Card>
          <CardLabel icon={<CheckCircle2 className="h-4 w-4 text-emerald" />} label="Tasks Complete" />
          <div className="mt-4 flex items-center gap-5">
            <Ring pct={dashboard?.tasks_completion_rate || 0} />
            <div>
              <div className="text-2xl font-bold">{dashboard?.tasks_completion_rate || 0}%</div>
              <div className="text-xs text-neutral-400">
                {dashboard?.completed_today || 0} of {dashboard?.total_today || 0} done
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <CardLabel icon={<Zap className="h-4 w-4 text-violet" />} label="XP & Level" />
          <div className="mt-4">
            <div className="inline-flex items-center rounded-full bg-violet/15 px-2.5 py-1 text-xs font-semibold text-violet-2">
              LEVEL {xp?.level || 1}
            </div>
            <div className="mt-3 text-sm text-neutral-300">
              {xp?.current_xp?.toLocaleString() || 0} / {xp?.xp_for_next_level?.toLocaleString() || 0} XP
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
              <div
                className="h-full bg-gradient-to-r from-violet to-emerald"
                style={{ width: `${((xp?.current_xp || 0) / (xp?.xp_for_next_level || 1)) * 100}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-neutral-400">
              {Math.round(((xp?.current_xp || 0) / (xp?.xp_for_next_level || 1)) * 100)}% to Level {(xp?.level || 1) + 1}
            </div>
          </div>
        </Card>
        <StatCard
          icon={<Calendar className="h-4 w-4 text-emerald" />}
          label="Active Days"
          value={String(dashboard?.active_days || 0)}
          sub={`${dashboard?.monthly_rate || 0}% this month`}
        />
      </div>

      {/* Heatmap */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Consistency Graph</h3>
          <select className="rounded-md border border-[#222] bg-[#0f0f0f] px-2 py-1 text-xs text-neutral-300">
            <option>2026</option>
            <option>2025</option>
          </select>
        </div>
        <Heatmap />
      </Card>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold mb-4">Today's Focus</h3>
          <ul className="space-y-2">
            {tasksLoading ? (
              [1,2,3].map(i => (
                <li key={i} className="flex items-center gap-3 rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] px-3 py-2.5">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </li>
              ))
            ) : (
              todayTasks.map((t: any) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] px-3 py-2.5"
                >
                  <button
                    onClick={() => completeTask.mutate(t.id)}
                    disabled={completeTask.isPending}
                    className={`grid h-5 w-5 place-items-center rounded border ${
                      t.completed
                        ? "border-emerald bg-emerald text-black"
                        : "border-[#333] hover:border-emerald"
                    }`}
                  >
                    {t.completed && <CheckCircle2 className="h-3 w-3" />}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      t.completed ? "line-through text-neutral-500" : "text-neutral-100"
                    }`}
                  >
                    {t.title}
                  </span>
                  <PriorityBadge p={t.priority} />
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">This Week</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={weeklyTrend}>
                <XAxis dataKey="day" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid #222",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <ReferenceLine y={avg} stroke="#8b5cf6" strokeDasharray="4 4" />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {weeklyTrend.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.pct >= 80 ? "#10b981" : d.pct >= 60 ? "#22c55e" : d.pct >= 40 ? "#eab308" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[#1c1c1c] bg-[#111] p-5 ${className}`}>{children}</div>
  );
}

export function CardLabel({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400">
      {icon}
      {label}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardLabel icon={icon} label={label} />
      <div className="mt-4 text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-neutral-400">{sub}</div>
    </Card>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} stroke="#1f1f1f" strokeWidth="8" fill="none" />
      <circle
        cx="36"
        cy="36"
        r={r}
        stroke="#10b981"
        strokeWidth="8"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="40" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600">
        {pct}%
      </text>
    </svg>
  );
}

export function PriorityBadge({ p }: { p: "high" | "medium" | "low" }) {
  const map = {
    high: "bg-red-500/15 text-red-400 border-red-500/20",
    medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    low: "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
  } as const;
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${map[p]}`}>
      {p}
    </span>
  );
}
