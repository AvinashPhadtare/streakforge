import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { setAuth, setToken } from "@/lib/auth";
import api from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — StreakForge" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!email.match(/^\S+@\S+\.\S+$/)) errs.email = "Enter a valid email";
    if (password.length < 6) errs.password = "Password must be at least 6 characters";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const authRes = await api.post("/api/v1/auth/login", { email, password });
      const token = authRes.data.access_token;
      setToken(token);
      
      const meRes = await api.get("/api/v1/auth/me");
      const user = meRes.data;
      setAuth({
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
      });
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setErrors({ general: "Invalid email or password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold tracking-tight">
        Welcome back <span className="ml-1">🔥</span>
      </h1>
      <p className="mt-1 text-sm text-neutral-400">Continue your streak.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {errors.general && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {errors.general}
          </div>
        )}
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60 transition"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign In
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        Don't have an account?{" "}
        <Link to="/register" className="text-emerald hover:underline">
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white">
      <div
        className="absolute inset-0 -z-10 opacity-50"
        style={{
          background:
            "radial-gradient(40% 40% at 50% 0%, rgba(16,185,129,0.18), transparent 60%)",
        }}
      />
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-12">
        <Link to="/" className="mb-8 flex items-center gap-2 text-lg font-bold">
          <Zap className="h-5 w-5 text-emerald" /> StreakForge
        </Link>
        <div className="glass w-full rounded-2xl p-7 glow-emerald">{children}</div>
      </div>
      <style>{`.auth-input{width:100%;border-radius:0.5rem;border:1px solid #222;background:#0f0f0f;padding:0.6rem 0.75rem;font-size:0.875rem;color:#fff;outline:none}.auth-input:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,0.15)}`}</style>
    </div>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-neutral-300">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
