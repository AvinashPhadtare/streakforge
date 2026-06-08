import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { Card, PriorityBadge } from "./dashboard";
import { useTasks, useCompleteTask, useDeleteTask, useUpdateTask, useCreateTask } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import { CheckCircle2, Pencil, Plus, Search, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — StreakForge" }] }),
  component: () => (
    <AppLayout>
      <TasksPage />
    </AppLayout>
  ),
});

function TasksPage() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();
  
  const [tab, setTab] = useState<"all" | "pending" | "in-progress" | "completed">("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"due" | "priority" | "created" | "category">("due");
  const [prio, setPrio] = useState<"all" | "high" | "medium" | "low">("all");
  const [selected, setSelected] = useState<any>(null);
  const [openNew, setOpenNew] = useState(false);
  const [newDraft, setNewDraft] = useState({ title: "", description: "", priority: "medium" as const, due_date: "" });

  const today = new Date().toISOString().slice(0, 10);
  const tasksList = tasks || [];

  const counts = {
    total: tasksList.length,
    pending: tasksList.filter((t: any) => !t.completed).length,
    completed: tasksList.filter((t: any) => t.completed).length,
    overdue: tasksList.filter((t: any) => !t.completed && t.due_date && t.due_date < today).length,
  };

  const filtered = useMemo(() => {
    let list = [...tasksList];
    if (tab === "pending") list = list.filter((t: any) => !t.completed);
    if (tab === "completed") list = list.filter((t: any) => t.completed);
    if (tab === "in-progress") list = list.filter((t: any) => !t.completed);
    if (prio !== "all") list = list.filter((t: any) => t.priority === prio);
    if (q) list = list.filter((t: any) => t.title.toLowerCase().includes(q.toLowerCase()));
    const prioRank: Record<string, number> = { high: 3, medium: 2, low: 1 };
    list.sort((a: any, b: any) => {
      if (sort === "priority") return (prioRank[a.priority] ?? 0) - (prioRank[b.priority] ?? 0);
      if (sort === "created") return (b.created_at || "").localeCompare(a.created_at || "");
      return (a.due_date || "").localeCompare(b.due_date || "");
    });
    return list;
  }, [tasksList, tab, q, sort, prio, today]);

  const toggle = (id: string) => completeTask.mutate(id);
  const remove = (id: string) => {
    deleteTask.mutate(id);
    setSelected(null);
  };
  
  const handleCreate = () => {
    if (!newDraft.title.trim()) return;
    createTask.mutate(newDraft, {
      onSuccess: () => {
        setOpenNew(false);
        setNewDraft({ title: "", description: "", priority: "medium", due_date: "" });
      }
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Tasks</h1>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-400">
            <Stat label="Total" value={counts.total} />
            <Stat label="Pending" value={counts.pending} className="text-yellow-400" />
            <Stat label="Completed" value={counts.completed} className="text-emerald" />
            <Stat label="Overdue" value={counts.overdue} className="text-red-400" />
          </div>
        </div>
        <button onClick={() => setOpenNew(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-black hover:brightness-110">
          <Plus className="h-4 w-4" /> New Task
        </button>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-lg border border-[#222] bg-[#0f0f0f] py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald"
            />
          </div>
          <div className="flex rounded-lg border border-[#222] bg-[#0e0e0e] p-1 text-xs">
            {(["all", "pending", "in-progress", "completed"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`rounded-md px-3 py-1.5 capitalize ${tab === k ? "bg-[#1a1a1a] text-white" : "text-neutral-400 hover:text-white"}`}
              >
                {k.replace("-", " ")}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-lg border border-[#222] bg-[#0f0f0f] px-3 py-2 text-xs"
          >
            <option value="due">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="created">Sort: Created</option>
          </select>
          <select
            value={prio}
            onChange={(e) => setPrio(e.target.value as typeof prio)}
            className="rounded-lg border border-[#222] bg-[#0f0f0f] px-3 py-2 text-xs capitalize"
          >
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </Card>

      <Card>
        {tasksLoading ? (
          <ul className="divide-y divide-[#1a1a1a]">
            {[1,2,3,4].map(i => (
              <li key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
              </li>
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-neutral-500">
            <div className="text-3xl">📭</div>
            <div className="mt-2">No tasks yet</div>
            <button onClick={() => setOpenNew(true)} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald px-3 py-1.5 text-xs font-semibold text-black">
              <Plus className="h-3.5 w-3.5" /> Add your first task
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-[#1a1a1a]">
            {filtered.map((t: any) => {
              const overdue = !t.completed && t.due_date && t.due_date < today;
              const isToday = t.due_date === today;
              return (
                <li
                  key={t.id}
                  className={`flex items-center gap-3 py-3 ${overdue ? "border-l-2 border-red-500 pl-3 -ml-3" : ""}`}
                >
                  <button
                    onClick={() => toggle(t.id)}
                    disabled={completeTask.isPending}
                    className={`grid h-5 w-5 place-items-center rounded border ${t.completed ? "border-emerald bg-emerald text-black" : "border-[#333] hover:border-emerald"}`}
                  >
                    {t.completed && <CheckCircle2 className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={() => setSelected(t)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className={`text-sm ${t.completed ? "line-through text-neutral-500" : ""}`}>{t.title}</div>
                    {t.description && <div className="text-xs text-neutral-500 truncate">{t.description}</div>}
                  </button>
                  <PriorityBadge p={t.priority} />
                  <span className={`text-xs ${overdue ? "text-red-400" : isToday ? "text-yellow-400" : "text-neutral-500"}`}>
                    {t.due_date || "—"}
                  </span>
                  {t.completed ? (
                    <span className="rounded-full bg-emerald/15 px-2 py-0.5 text-[10px] font-semibold text-emerald">COMPLETED</span>
                  ) : overdue ? (
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400">OVERDUE</span>
                  ) : (
                    <span className="rounded-full bg-neutral-500/15 px-2 py-0.5 text-[10px] font-semibold text-neutral-400">OPEN</span>
                  )}
                  <div className="flex items-center gap-1">
                    <button className="rounded-md p-1.5 text-neutral-500 hover:bg-white/5 hover:text-white">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => remove(t.id)} disabled={deleteTask.isPending} className="rounded-md p-1.5 text-neutral-500 hover:bg-white/5 hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={() => setSelected(null)} />
          <aside className="w-full max-w-md border-l border-[#1c1c1c] bg-[#0d0d0d] p-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Task Details</h3>
              <button onClick={() => setSelected(null)} className="text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <div className="text-xs text-neutral-500">Title</div>
                <div className="mt-1 text-base font-semibold">{selected.title}</div>
              </div>
              {selected.description && (
                <div>
                  <div className="text-xs text-neutral-500">Description</div>
                  <p className="mt-1 text-neutral-300">{selected.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-neutral-500">Priority</div>
                  <div className="mt-1"><PriorityBadge p={selected.priority} /></div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Due</div>
                  <div className="mt-1 text-neutral-200">{selected.due_date || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Created</div>
                  <div className="mt-1 text-neutral-200">{selected.created_at || "—"}</div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-2">
              <button
                onClick={() => { toggle(selected.id); setSelected(null); }}
                className="flex-1 rounded-lg bg-emerald px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110"
              >
                {selected.completed ? "Mark Open" : "Mark Complete"}
              </button>
              <button
                onClick={() => remove(selected.id)}
                className="rounded-lg border border-red-500/40 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
              >
                Delete
              </button>
            </div>
          </aside>
        </div>
      )}

      {openNew && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={() => setOpenNew(false)} />
          <aside className="w-full max-w-md border-l border-[#1c1c1c] bg-[#0d0d0d] p-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">New Task</h3>
              <button onClick={() => setOpenNew(false)} className="text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <div className="text-xs text-neutral-500">Title</div>
                <input
                  value={newDraft.title}
                  onChange={(e) => setNewDraft({...newDraft, title: e.target.value})}
                  className="w-full mt-1 rounded-lg border border-[#222] bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-emerald"
                  placeholder="Task title..."
                />
              </div>
              <div>
                <div className="text-xs text-neutral-500">Description</div>
                <textarea
                  value={newDraft.description}
                  onChange={(e) => setNewDraft({...newDraft, description: e.target.value})}
                  className="w-full mt-1 rounded-lg border border-[#222] bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-emerald"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-neutral-500">Priority</div>
                  <select
                    value={newDraft.priority}
                    onChange={(e) => setNewDraft({...newDraft, priority: e.target.value as any})}
                    className="w-full mt-1 rounded-lg border border-[#222] bg-[#0f0f0f] px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Due Date</div>
                  <input
                    type="date"
                    value={newDraft.due_date}
                    onChange={(e) => setNewDraft({...newDraft, due_date: e.target.value})}
                    className="w-full mt-1 rounded-lg border border-[#222] bg-[#0f0f0f] px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-2">
              <button onClick={handleCreate} className="flex-1 rounded-lg bg-emerald px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110">
                Create Task
              </button>
              <button onClick={() => setOpenNew(false)} className="rounded-lg border border-[#222] px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/5">
                Cancel
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, className = "" }: { label: string; value: number; className?: string }) {
  return (
    <span className="rounded-full border border-[#222] bg-white/5 px-3 py-1">
      <span className={`font-semibold ${className}`}>{value}</span>
      <span className="ml-1 text-neutral-400">{label}</span>
    </span>
  );
}
