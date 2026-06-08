import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { Card } from "./dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useHabits, useCreateHabit } from "@/hooks/useApi";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Flame, Plus, X } from "lucide-react";

import type { Habit } from "@/lib/mock-data";

type HabitDraft = {
  name: string;
  description: string;
  category: string;
  frequency: "daily" | "weekdays" | "weekends" | "custom";
  customDays: number[];
};

export const Route = createFileRoute("/habits")({
  head: () => ({ meta: [{ title: "Habits — StreakForge" }] }),
  component: () => (
    <AppLayout>
      <HabitsPage />
    </AppLayout>
  ),
});

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

function HabitsPage() {
  const { data: habits = [], isLoading } = useHabits();
  const queryClient = useQueryClient();
  const createHabit = useCreateHabit();

  const logHabit = async (id: string) => {
    await api.post(`/api/v1/habits/${id}/log`);
    queryClient.invalidateQueries({ queryKey: ["habits"] });
  };
  
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<HabitDraft>({
    name: "",
    description: "",
    category: "",
    frequency: "daily",
    customDays: [],
  });

  const habitsList = habits;
  const best = habitsList.length ? Math.max(...habitsList.map((h) => h.best || 0)) : 0;
  const doneToday = habitsList.filter((h) => h.doneToday).length;

  const add = () => {
    if (!draft.name.trim()) return;
    createHabit.mutate({ name: draft.name, description: draft.description }, {
      onSuccess: () => {
        setDraft({
          name: "",
          description: "",
          category: "",
          frequency: "daily",
          customDays: [],
        });
        setOpen(false);
      }
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Habits</h1>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-400">
            <Pill>{habits.length} Active Habits</Pill>
            <Pill>Best streak: {best} days</Pill>
            <Pill>Today: {doneToday}/{habits.length} done</Pill>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> New Habit
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {habits.map((h) => (
          <Card key={h.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{h.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="rounded-md border border-[#222] bg-[#0e0e0e] px-2 py-0.5 text-neutral-400">{h.category}</span>
                  <span className="rounded-md bg-violet/15 px-2 py-0.5 capitalize text-violet-2">{h.frequency}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-2xl font-bold text-emerald">
                  <Flame className="h-5 w-5" /> {h.streak}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500">day streak</div>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-xs text-neutral-400">
              <span>Best: <span className="text-neutral-200">{h.best}</span></span>
              <span>Total: <span className="text-neutral-200">{h.total}</span></span>
            </div>

            <div className="mt-4 flex flex-wrap gap-1">
              {h.last30.map((v: number, i: number) => (
                <span
                  key={i}
                  title={`Day -${29 - i}`}
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: v === 1 ? "#10b981" : "#1f1f1f" }}
                />
              ))}
            </div>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11px] text-neutral-500">
                <span>This week</span>
                <span>{Math.round(h.weekProgress * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#1a1a1a]">
                <div className="h-full bg-emerald" style={{ width: `${h.weekProgress * 100}%` }} />
              </div>
            </div>

            <button
              onClick={() => logHabit(h.id)}
              disabled={h.doneToday}
              className={`mt-4 w-full rounded-lg px-3 py-2 text-sm font-semibold transition ${h.doneToday ? "bg-emerald text-black cursor-default" : "border border-emerald/50 text-emerald hover:bg-emerald/10"}`}
            >
              {h.doneToday ? "✓ Done Today" : "Log Today"}
            </button>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Habit Insights</h3>
          <span className="text-xs text-neutral-400">78% retention this month</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {habits.map((h) => (
            <div key={h.id} className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-neutral-300">{h.name}</span>
                <span className="text-neutral-500">7d</span>
              </div>
              <div className="flex items-end gap-1 h-10">
                {h.last30.slice(-7).map((v: number, i: number) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{ height: v ? "100%" : "20%", background: v ? "#10b981" : "#1f1f1f" }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">New Habit</h3>
              <button onClick={() => setOpen(false)} className="text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 space-y-4 text-sm">
              <Inp label="Habit name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Read 20 pages" />
              <div>
                <label className="mb-1.5 block text-xs text-neutral-300">Description</label>
                <textarea rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0f0f0f] px-3 py-2 outline-none focus:border-emerald" />
              </div>
              <Inp label="Category" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} placeholder="reading" />
              <div>
                <label className="mb-1.5 block text-xs text-neutral-300">Frequency</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["daily", "weekdays", "weekends", "custom"] as const).map((f: Habit['frequency']) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setDraft({ ...draft, frequency: f })}
                      className={`rounded-lg border px-3 py-2 text-xs capitalize ${draft.frequency === f ? "border-emerald bg-emerald/10 text-emerald" : "border-[#222] text-neutral-300 hover:border-[#333]"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              {draft.frequency === "custom" && (
                <div>
                  <label className="mb-1.5 block text-xs text-neutral-300">Pick days</label>
                  <div className="flex gap-1.5">
                    {DAYS.map((d, i) => {
                      const active = draft.customDays.includes(i);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            setDraft((p) => ({
                              ...p,
                              customDays: active ? p.customDays.filter((x: number) => x !== i) : [...p.customDays, i],
                            }))
                          }
                          className={`h-9 w-9 rounded-full border text-xs font-semibold ${active ? "border-emerald bg-emerald text-black" : "border-[#222] text-neutral-400 hover:border-[#333]"}`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={add} className="flex-1 rounded-lg bg-emerald px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110">
                Create Habit
              </button>
              <button onClick={() => setOpen(false)} className="rounded-lg border border-[#222] px-4 py-2.5 text-sm hover:bg-white/5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-[#222] bg-white/5 px-3 py-1">{children}</span>;
}

function Inp({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-neutral-300">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-[#222] bg-[#0f0f0f] px-3 py-2 outline-none focus:border-emerald" />
    </div>
  );
}
