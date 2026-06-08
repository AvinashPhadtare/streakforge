import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Repeat,
  BarChart3,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import { clearAuth, getAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/today", label: "Today", icon: Calendar },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/habits", label: "Habits", icon: Repeat },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const user = getAuth();
  const initials = (user?.name || user?.username || "SF")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-[#1a1a1a] bg-[#0c0c0c]">
      <div className="px-6 py-6">
        <Link to="/" className="flex items-center gap-2 text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald/10 text-emerald">
            <Zap className="h-4 w-4" />
          </span>
          <span className="font-bold tracking-tight">StreakForge</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {items.map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-emerald/10 text-emerald"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl border border-[#1c1c1c] bg-[#0f0f0f] p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald to-violet text-xs font-bold text-black">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">
              {user?.name || user?.username || "Guest"}
            </div>
            <div className="mt-0.5 inline-flex items-center rounded-full bg-violet/15 px-2 py-0.5 text-[10px] font-semibold text-violet-2">
              LEVEL 7
            </div>
          </div>
          <button
            onClick={() => {
              clearAuth();
              navigate({ to: "/login" });
            }}
            className="rounded-md p-1.5 text-neutral-500 hover:bg-white/5 hover:text-white"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
