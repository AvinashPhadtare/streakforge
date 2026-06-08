import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { setAuth, setToken } from "@/lib/auth";
import { AuthShell, Field } from "./login";
import api from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — StreakForge" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (username.length < 3) errs.username = "Username must be at least 3 characters";
    if (!email.match(/^\S+@\S+\.\S+$/)) errs.email = "Enter a valid email";
    if (password.length < 6) errs.password = "Password must be at least 6 characters";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const authRes = await api.post("/api/v1/auth/register", { 
        full_name: name,
        username, 
        email, 
        password 
      });
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
      setErrors({ general: err.response?.data?.detail || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Start building your consistency streak today.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {errors.general && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {errors.general}
          </div>
        )}
        <Field label="Full Name (optional)">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
            placeholder="Ada Lovelace"
          />
        </Field>
        <Field label="Username" error={errors.username}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input"
            placeholder="ada"
          />
        </Field>
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
          Create Account
        </button>

        <div className="relative my-2 text-center text-xs text-neutral-500">
          <span className="bg-transparent px-2">or</span>
          <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-[#222]" />
        </div>

        <p className="text-center text-sm text-neutral-400">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald hover:underline">
            Sign in
          </Link>
        </p>
      </form>

      <p className="mt-6 text-center text-xs text-neutral-500">
        Free forever. No credit card needed.
      </p>
    </AuthShell>
  );
}
