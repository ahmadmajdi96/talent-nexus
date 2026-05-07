import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Briefcase, Loader2 } from "lucide-react";
import { signIn, useAuthSession } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — CORTA Acquisition" }] }),
  component: LoginPage,
});

function LoginPage() {
  const session = useAuthSession();
  const nav = useNavigate();
  const { location } = useRouterState();
  const redirectTo = new URLSearchParams(location.search).get("redirect") || "/";
  const [email, setEmail] = useState("nora.haddad@corta.com");
  const [password, setPassword] = useState("demo1234");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (session) nav({ to: redirectTo }); }, [session, redirectTo, nav]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try { signIn(email.trim(), password); }
    catch (e: any) { setErr(e?.message || "Sign in failed"); setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--gradient-hero)" }}>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-md" style={{ background: "var(--gradient-primary)" }}>
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-foreground">CORTA Acquisition</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Talent Acquisition</div>
          </div>
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-6">Sign in to continue to your hiring workspace.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground">Work email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-md bg-muted/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/50" />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-md bg-muted/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/50" />
          </div>
          {err && <div className="text-xs text-destructive">{err}</div>}
          <button type="submit" disabled={loading}
            className="w-full h-10 rounded-md text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 inline-flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
          </button>
          <p className="text-[11px] text-muted-foreground text-center">Demo mode · any email + password (4+ chars) works.</p>
        </form>
      </div>
    </div>
  );
}
