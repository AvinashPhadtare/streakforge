import type { Priority } from "@/lib/mock-data";
import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { Card, PriorityBadge } from "./dashboard";
import { useTasks, useHabits, useCompleteTask, useLogHabit, useCreateTask } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import { CheckCircle2, Flame, Plus, X } from "lucide-react";

export const Route = createFileRoute("/today")({
  head: () => ({ meta: [{ title: "Today — StreakForge" }] }),
  component: () => (
    <AppLayout>
      <TodayPage />
    </AppLayout>
  ),
});

function TodayPage() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const completeTask = useCompleteTask();
  const logHabit = useLogHabit();
  const createTask = useCreateTask();
  
  const [tab, setTab] = useState<"all" | "pending" | "completed">("all");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{ title: string; description: string; priority: "low" | "medium" | "high"; category: string; dueDate: string; estimated: string }>({
    title: "", description: "", priority: "medium", category: "", dueDate: "", estimated: "",
  });

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const tasksList = tasks || [];
  const habitsList = habits || [];
  
  const tasksDone = tasksList.filter((t: any) => t.completed).length;
  const habitsDone = habitsList.filter((h: any) => h.logged_today).length;
  const total = tasksList.length + habitsList.length;
  const completed = tasksDone + habitsDone;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const xp = tasksDone * 10 + habitsDone * 5;

  const filtered = useMemo(() => {
    if (tab === "pending") return tasksList.filter((t: any) => !t.completed);
    if (tab === "completed") return tasksList.filter((t: any) => t.completed);
    return tasksList;
  }, [tasksList, tab]);

  const status = pct >= 80 ? { label: "ON FIRE 🔥", cls: "bg-emerald/15 text-emerald" } : pct >= 50 ? { label: "ON TRACK 🔥", cls: "bg-emerald/15 text-emerald" } : { label: "CATCH UP", cls: "bg-yellow-500/15 text-yellow-400" };

  const summary = pct === 100 ? "🏆 Perfect day! You crushed it!" : pct >= 75 ? "🔥 Strong day! Keep the streak!" : pct >= 50 ? "💪 Good progress! Finish strong!" : "⚡ There's still time to turn it around!";

  const addTask = () => {
    if (!draft.title.trim()) return;
    createTask.mutate({
      title: draft.title,
      description: draft.description,
      priority: draft.priority,
      due_date: draft.dueDate || new Date().toISOString().split('T')[0]
    }, {
      onSuccess: () => {
        setDraft({ title: "", description: "", priority: "medium", category: "", dueDate: "", estimated: "" });
        setOpen(false);
      }
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dateStr}</h1>
          <div className="mt-2 flex items-center gap-3">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.cls}`}>{status.label}</span>
            <span className="text-sm text-neutral-400">Today's overall completion</span>
          </div>
        </div>
        <div className="flex gap-3 text-sm">
          <Pill>{tasksDone}/{tasksList.length} Tasks</Pill>
          <Pill>{habitsDone}/{habitsList.length} Habits</Pill>
          <Pill>+{xp} XP today</Pill>
        </div>
      </div>

      <Card>
        <div className="mb-2 flex items-center justify-between text-sm text-neutral-300">
          <span>Day progress</span>
          <span className="font-semibold">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
          <div className="h-full bg-gradient-to-r from-emerald to-violet" style={{ width: `${pct}%` }} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Tasks */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Tasks</h3>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald px-3 py-1.5 text-xs font-semibold text-black hover:brightness-110"
            >
              <Plus className="h-3.5 w-3.5" /> Add Task
            </button>
          </div>
          <div className="mb-3 flex gap-1 rounded-lg border border-[#1f1f1f] bg-[#0e0e0e] p-1 text-xs">
            {(["all", "pending", "completed"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`flex-1 rounded-md px-2 py-1.5 capitalize transition ${tab === k ? "bg-[#1a1a1a] text-white" : "text-neutral-500 hover:text-white"}`}
              >
                {k}
              </button>
            ))}
          </div>
          <ul className="space-y-2">
            {tasksLoading ? (
              [1,2,3].map(i => (
                <li key={i} className="flex items-center gap-3 rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] px-3 py-2.5">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </li>
              ))
            ) : filtered.length === 0 ? (
              <li className="rounded-lg border border-dashed border-[#222] p-6 text-center text-sm text-neutral-500">
                No tasks here.
              </li>
            ) : (
              filtered.map((t: any) => (
                <li
                  key={t.id}
                  className={`flex items-center gap-3 rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] px-3 py-2.5 ${t.completed ? "opacity-60" : ""}`}
                >
                  <button
                    onClick={() => completeTask.mutate(t.id)}
                    disabled={completeTask.isPending}
                    className={`grid h-5 w-5 place-items-center rounded border ${t.completed ? "border-emerald bg-emerald text-black" : "border-[#333] hover:border-emerald"}`}
                  >
                    {t.completed && <CheckCircle2 className="h-3 w-3" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${t.completed ? "line-through text-neutral-500" : "text-neutral-100"}`}>{t.title}</div>
                    <div className="mt-0.5 text-[11px] text-neutral-500">{t.category || "general"}</div>
                  </div>
                  <PriorityBadge p={t.priority} />
                </li>
              ))
            )}
          </ul>
        </Card>

        {/* Habits */}
        <Card>
          <h3 className="mb-4 font-semibold">Habits</h3>
          <div className="grid gap-2">
            {habitsLoading ? (
              [1,2,3].map(i => (
                <li key={i} className="flex items-center gap-3 rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] px-3 py-3">
                  <Skeleton className="h-7 w-7 rounded-md" />
                  <Skeleton className="h-4 flex-1" />
                </li>
              ))
            ) : (
              habitsList.map((h: any) => (
                <button
                  key={h.id}
                  onClick={() => logHabit.mutate(h.id)}
                  disabled={logHabit.isPending}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${h.logged_today ? "border-emerald/40 bg-emerald/10" : "border-[#1a1a1a] bg-[#0f0f0f] hover:border-emerald/30"}`}
                >
                  <div className={`grid h-7 w-7 place-items-center rounded-md ${h.logged_today ? "bg-emerald text-black" : "border border-[#333] text-neutral-500"}`}>
                    {h.logged_today && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{h.name}</div>
                    <div className="text-[11px] text-neutral-500">{h.description || ""}</div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald">
                    <Flame className="h-3.5 w-3.5" /> {h.current_streak || 0}d
                  </span>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="text-center">
        <div className="text-xs uppercase tracking-wider text-neutral-400">Day Summary</div>
        <div className="mt-2 text-lg font-semibold">{summary}</div>
        <div className="mt-3 flex items-center justify-center gap-6 text-sm text-neutral-300">
          <span>⚡ {xp} XP earned</span>
          <span>✅ {tasksDone} tasks</span>
          <span>🔁 {habitsDone} habits</span>
        </div>
      </Card>

      {/* Slide-in add task panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="w-full max-w-md border-l border-[#1c1c1c] bg-[#0d0d0d] p-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">New Task</h3>
              <button className="text-neutral-500 hover:text-white" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 space-y-4 text-sm">
              <Input label="Task title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="Write the chapter…" />
              <div>
                <label className="mb-1.5 block text-xs text-neutral-300">Description</label>
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="w-full rounded-lg border border-[#222] bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-emerald"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-neutral-300">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDraft({ ...draft, priority: p })}
                      className={`rounded-lg border px-3 py-2 text-xs capitalize ${draft.priority === p ? "border-emerald bg-emerald/10 text-emerald" : "border-[#222] text-neutral-300 hover:border-[#333]"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <Input label="Category" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} placeholder="coding" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Due date" type="date" value={draft.dueDate} onChange={(v) => setDraft({ ...draft, dueDate: v })} />
                <Input label="Est. minutes" type="number" value={draft.estimated} onChange={(v) => setDraft({ ...draft, estimated: v })} placeholder="45" />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={addTask} className="flex-1 rounded-lg bg-emerald px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110">
                Add Task
              </button>
              <button onClick={() => setOpen(false)} className="rounded-lg border border-[#222] px-4 py-2.5 text-sm hover:bg-white/5">
                Cancel
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-[#222] bg-white/5 px-3 py-1 text-neutral-200">{children}</span>;
}

export function Input({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-neutral-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#222] bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-emerald"
      />
    </div>
  );
}
