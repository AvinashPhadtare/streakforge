import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Zap,
  Flame,
  BarChart3,
  CheckCircle2,
  Repeat,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Heatmap } from "@/components/heatmap";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StreakForge — Turn Daily Actions Into Unstoppable Streaks" },
      {
        name: "description",
        content:
          "A personal consistency engine. Track tasks, build habits, earn XP, and watch your streak grow — one day at a time.",
      },
      { property: "og:title", content: "StreakForge — Personal Consistency Engine" },
      {
        property: "og:description",
        content: "Track tasks, build habits, earn XP. Build real consistency.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Flame, title: "Streak Tracking", desc: "Never lose your momentum. Daily streaks that keep you honest." },
  { icon: BarChart3, title: "Contribution Heatmap", desc: "See your consistency visually — a year at a glance." },
  { icon: Zap, title: "XP & Levels", desc: "Gamify your daily progress and unlock new levels." },
  { icon: CheckCircle2, title: "Task Engine", desc: "Plan, prioritize and complete tasks with purpose." },
  { icon: Repeat, title: "Habit System", desc: "Build routines that stick with smart frequency control." },
  { icon: TrendingUp, title: "Deep Analytics", desc: "Understand the patterns behind your best weeks." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#161616] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <Zap className="h-5 w-5 text-emerald" />
            <span>StreakForge</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg border border-[#222] px-4 py-2 text-sm text-neutral-200 hover:bg-white/5 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-black hover:brightness-110 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(16,185,129,0.18), transparent 60%), radial-gradient(40% 40% at 80% 30%, rgba(139,92,246,0.15), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-white/5 px-3 py-1 text-xs text-neutral-300">
            <Sparkles className="h-3 w-3 text-emerald" />
            Personal Consistency Engine
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Turn Daily Actions Into
            <br />
            <span className="text-gradient">Unstoppable Streaks</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400">
            Track tasks, build habits, earn XP, and watch your consistency grow — one day at a time.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald px-5 py-3 text-sm font-semibold text-black hover:brightness-110 transition glow-emerald"
            >
              Start for Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how"
              className="rounded-lg border border-[#222] px-5 py-3 text-sm text-neutral-200 hover:bg-white/5 transition"
            >
              See How It Works
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
            <Pill>🔥 47-day streak</Pill>
            <Pill>⚡ 2,840 XP</Pill>
            <Pill>✅ 94% completion</Pill>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything you need to stay consistent
          </h2>
          <p className="mt-3 text-neutral-400">
            A complete toolkit for the people who show up — every single day.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group glass rounded-2xl p-6 hover:border-emerald/40 transition-colors"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-neutral-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Heatmap preview */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Your consistency, beautifully visualized
          </h2>
          <p className="mt-3 text-neutral-400">A year of effort, in one glance.</p>
        </div>
        <div className="glass rounded-2xl p-6 md:p-8">
          <Heatmap />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <MiniStat label="Current Streak" value="🔥 23 days" />
            <MiniStat label="Total Contributions" value="📅 187" />
            <MiniStat label="Longest Streak" value="⭐ 41 days" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple daily loop</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3 relative">
          {[
            { n: "1", t: "Plan your day", d: "Add tasks and habits that matter." },
            { n: "2", t: "Complete & track", d: "Check off as you go through the day." },
            { n: "3", t: "See your growth", d: "Watch streaks, XP and analytics grow." },
          ].map((s) => (
            <div key={s.n} className="glass rounded-2xl p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald to-violet font-bold text-black">
                {s.n}
              </div>
              <h3 className="text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-neutral-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="gradient-border-inner">
          <div className="rounded-2xl bg-[#0c0c0c] p-10 md:p-14 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to build real consistency?
            </h2>
            <p className="mt-3 text-neutral-400">
              Join thousands building better habits every day.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald px-6 py-3 text-sm font-semibold text-black hover:brightness-110 transition glow-emerald"
            >
              Start for Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#161616] py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald" />
            <span className="font-semibold text-neutral-300">StreakForge</span>
            <span className="ml-2">— Build the habit of showing up.</span>
          </div>
          <div>Built with ❤️ for consistency</div>
        </div>
      </footer>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#1f1f1f] bg-white/5 px-3 py-1 text-neutral-200">
      {children}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#1c1c1c] bg-[#0f0f0f] px-4 py-3 flex items-center justify-between">
      <span className="text-neutral-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
