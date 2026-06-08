// Deterministic mock data for StreakForge

export type Priority = "high" | "medium" | "low";
export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: string;
  dueDate?: string; // ISO date
  done: boolean;
  createdAt: string;
  completedAt?: string;
};

export type Habit = {
  id: string;
  name: string;
  category: string;
  frequency: "daily" | "weekdays" | "weekends" | "custom";
  customDays?: number[]; // 0=Sun..6=Sat
  streak: number;
  best: number;
  total: number;
  doneToday: boolean;
  last30: number[]; // 0=missed,1=done,2=not-scheduled
  weekProgress: number; // 0..1
};

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

// Seeded pseudo-random
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateHeatmap(weeks = 52) {
  const rng = mulberry32(42);
  const cells: { date: string; value: number }[] = [];
  // start so that grid ends on today's weekday
  const totalDays = weeks * 7;
  const start = addDays(today, -(totalDays - 1));
  for (let i = 0; i < totalDays; i++) {
    const d = addDays(start, i);
    const r = rng();
    // skew: 35% empty, then increasing
    let v = 0;
    if (r > 0.95) v = 5;
    else if (r > 0.8) v = 4;
    else if (r > 0.6) v = 3;
    else if (r > 0.45) v = 2;
    else if (r > 0.3) v = 1;
    else v = 0;
    cells.push({ date: iso(d), value: v });
  }
  return cells;
}

export const HEATMAP_COLORS = [
  "#1a1a1a",
  "#166534",
  "#15803d",
  "#16a34a",
  "#22c55e",
  "#4ade80",
];

export const stats = {
  currentStreak: 23,
  bestStreak: 41,
  xp: 2840,
  xpNext: 3500,
  level: 7,
  totalContributions: 187,
  monthRate: 94,
  consistency: 84,
  momentum: 72,
  discipline: 91,
  activeDaysMonth: 23,
};

export const tasks: Task[] = [
  { id: "t1", title: "Study FastAPI", description: "Finish auth + middleware chapter", priority: "high", category: "coding", dueDate: iso(today), done: false, createdAt: iso(addDays(today, -1)) },
  { id: "t2", title: "Morning workout", priority: "medium", category: "health", dueDate: iso(today), done: true, createdAt: iso(addDays(today, -1)), completedAt: iso(today) },
  { id: "t3", title: "Read 20 pages", priority: "low", category: "reading", dueDate: iso(today), done: false, createdAt: iso(addDays(today, -2)) },
  { id: "t4", title: "Code review", priority: "high", category: "work", dueDate: iso(today), done: true, createdAt: iso(addDays(today, -1)), completedAt: iso(today) },
  { id: "t5", title: "Team standup", priority: "medium", category: "work", dueDate: iso(today), done: true, createdAt: iso(addDays(today, -1)), completedAt: iso(today) },
  { id: "t6", title: "Write blog post", description: "Draft 'Consistency over intensity'", priority: "medium", category: "writing", dueDate: iso(addDays(today, 1)), done: false, createdAt: iso(addDays(today, -3)) },
  { id: "t7", title: "Pay rent", priority: "high", category: "personal", dueDate: iso(addDays(today, -2)), done: false, createdAt: iso(addDays(today, -5)) },
  { id: "t8", title: "Plan weekly review", priority: "low", category: "personal", dueDate: iso(addDays(today, 2)), done: false, createdAt: iso(addDays(today, -1)) },
];

export const habits: Habit[] = [
  { id: "h1", name: "Meditate 10 min", category: "mindfulness", frequency: "daily", streak: 23, best: 41, total: 187, doneToday: true, last30: mockLast30(23, 0.85), weekProgress: 0.85 },
  { id: "h2", name: "Read 20 pages", category: "reading", frequency: "daily", streak: 12, best: 28, total: 142, doneToday: false, last30: mockLast30(12, 0.7), weekProgress: 0.7 },
  { id: "h3", name: "Workout", category: "health", frequency: "weekdays", streak: 8, best: 19, total: 96, doneToday: true, last30: mockLast30(8, 0.75), weekProgress: 0.6 },
  { id: "h4", name: "Code 1 hour", category: "coding", frequency: "daily", streak: 17, best: 35, total: 164, doneToday: true, last30: mockLast30(17, 0.9), weekProgress: 0.9 },
  { id: "h5", name: "Journal", category: "mindfulness", frequency: "daily", streak: 5, best: 22, total: 88, doneToday: false, last30: mockLast30(5, 0.55), weekProgress: 0.45 },
  { id: "h6", name: "Long run", category: "health", frequency: "weekends", streak: 4, best: 9, total: 32, doneToday: true, last30: mockLast30(4, 0.5), weekProgress: 1 },
];

function mockLast30(streak: number, rate: number) {
  const rng = mulberry32(streak * 17 + 3);
  const arr: number[] = [];
  for (let i = 29; i >= 0; i--) {
    if (i < streak) arr.push(1);
    else arr.push(rng() < rate ? 1 : 0);
  }
  return arr;
}

export const weeklyTrend = [
  { day: "Mon", pct: 80 },
  { day: "Tue", pct: 95 },
  { day: "Wed", pct: 60 },
  { day: "Thu", pct: 88 },
  { day: "Fri", pct: 72 },
  { day: "Sat", pct: 40 },
  { day: "Sun", pct: 65 },
];

export const weekdayAvg = [
  { day: "Mon", pct: 82 },
  { day: "Tue", pct: 90 },
  { day: "Wed", pct: 71 },
  { day: "Thu", pct: 85 },
  { day: "Fri", pct: 78 },
  { day: "Sat", pct: 52 },
  { day: "Sun", pct: 61 },
];

export const completionTrend = Array.from({ length: 30 }).map((_, i) => {
  const rng = mulberry32(i * 7 + 1);
  const base = 60 + Math.sin(i / 4) * 15 + rng() * 20;
  return {
    date: iso(addDays(today, i - 29)),
    pct: Math.max(20, Math.min(100, Math.round(base))),
    avg: Math.max(20, Math.min(100, Math.round(60 + Math.sin(i / 5) * 10))),
  };
});

export const categories = [
  { name: "Coding", rate: 92, count: 84, icon: "💻" },
  { name: "Health", rate: 78, count: 56, icon: "💪" },
  { name: "Reading", rate: 71, count: 41, icon: "📚" },
  { name: "Personal", rate: 65, count: 33, icon: "🌱" },
  { name: "Work", rate: 88, count: 72, icon: "🧠" },
];

export const weeklyReports = [
  { week: "Jun 1 – Jun 7", tasks: 28, habits: 38, avg: 92, xp: 640, status: "Perfect Week" },
  { week: "May 25 – May 31", tasks: 24, habits: 34, avg: 81, xp: 520, status: "Good Week" },
  { week: "May 18 – May 24", tasks: 19, habits: 28, avg: 68, xp: 420, status: "Good Week" },
  { week: "May 11 – May 17", tasks: 14, habits: 19, avg: 48, xp: 280, status: "Needs Work" },
  { week: "May 4 – May 10", tasks: 27, habits: 36, avg: 89, xp: 600, status: "Perfect Week" },
];
