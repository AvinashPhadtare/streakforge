import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { Card } from "./dashboard";
import { useState } from "react";
import { clearAuth, getAuth } from "@/lib/auth";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — StreakForge" }] }),
  component: () => (
    <AppLayout>
      <SettingsPage />
    </AppLayout>
  ),
});

function SettingsPage() {
  const navigate = useNavigate();
  const user = getAuth();
  const initials = (user?.name || user?.username || "SF")
    .split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  const [profile, setProfile] = useState({ name: user?.name || "", username: user?.username || "", email: user?.email || "" });
  const [timezone, setTimezone] = useState("UTC");
  const [weekStart, setWeekStart] = useState<"mon" | "sun">("mon");
  const [reminder, setReminder] = useState(true);
  const [dark, setDark] = useState(true);
  const [threshold, setThreshold] = useState(50);
  const [grace, setGrace] = useState(true);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-neutral-400">Manage your account and preferences.</p>
      </div>

      <Section title="Profile">
        <div className="flex items-start gap-5">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald to-violet text-lg font-bold text-black">
            {initials}
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <Field label="Full Name"><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="inp" /></Field>
            <Field label="Username"><input value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} className="inp" /></Field>
            <Field label="Email"><input value={profile.email} readOnly className="inp opacity-60" /></Field>
          </div>
        </div>
        <div className="mt-5 text-right">
          <button className="rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-black hover:brightness-110">Save Changes</button>
        </div>
      </Section>

      <Section title="Account">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Current password"><input type="password" className="inp" /></Field>
          <Field label="New password"><input type="password" className="inp" /></Field>
          <Field label="Confirm new password"><input type="password" className="inp" /></Field>
        </div>
        <div className="mt-5 text-right">
          <button className="rounded-lg border border-[#222] px-4 py-2 text-sm hover:bg-white/5">Update Password</button>
        </div>
      </Section>

      <Section title="Preferences">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Timezone">
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="inp">
              <option>UTC</option>
              <option>America/New_York</option>
              <option>Europe/London</option>
              <option>Asia/Tokyo</option>
            </select>
          </Field>
          <Field label="Week starts on">
            <div className="flex gap-2">
              {(["mon", "sun"] as const).map((d) => (
                <button key={d} onClick={() => setWeekStart(d)} className={`flex-1 rounded-lg border px-3 py-2 text-xs uppercase ${weekStart === d ? "border-emerald bg-emerald/10 text-emerald" : "border-[#222] text-neutral-300"}`}>
                  {d === "mon" ? "Monday" : "Sunday"}
                </button>
              ))}
            </div>
          </Field>
          <Toggle label="Daily reminder" checked={reminder} onChange={setReminder} hint="Get notified at 9pm if you haven't logged today." />
          <Toggle label="Dark theme" checked={dark} onChange={setDark} hint="Currently the only theme StreakForge ships with." />
        </div>
      </Section>

      <Section title="Streak Settings">
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-neutral-300">Minimum completion for streak</label>
              <span className="text-sm font-semibold text-emerald">{threshold}%</span>
            </div>
            <input
              type="range" min={1} max={100} value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="mt-3 w-full accent-emerald"
            />
            <p className="mt-2 text-xs text-neutral-500">A day counts toward your streak when you complete at least {threshold}% of planned items.</p>
          </div>
          <Toggle label="Allow 1 grace day per month" checked={grace} onChange={setGrace} />
        </div>
      </Section>

      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
        <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
        <p className="mt-1 text-sm text-neutral-400">These actions cannot be undone.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">Reset all data</button>
          <button
            onClick={() => { clearAuth(); navigate({ to: "/" }); }}
            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
          >
            Delete Account
          </button>
        </div>
      </div>

      <style>{`.inp{width:100%;border-radius:0.5rem;border:1px solid #222;background:#0f0f0f;padding:0.55rem 0.75rem;font-size:0.875rem;color:#fff;outline:none}.inp:focus{border-color:#10b981}`}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <h2 className="mb-5 text-lg font-semibold">{title}</h2>
      {children}
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-neutral-400">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-neutral-200">{label}</div>
          {hint && <div className="text-xs text-neutral-500 mt-0.5">{hint}</div>}
        </div>
        <button
          onClick={() => onChange(!checked)}
          className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-emerald" : "bg-[#222]"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>
    </div>
  );
}
