import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "./app-sidebar";
import { getAuth } from "@/lib/auth";

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getAuth()) {
      navigate({ to: "/login" });
    } else {
      setReady(true);
    }
  }, [navigate]);

  if (!ready) return null;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <AppSidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
