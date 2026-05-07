import { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Briefcase, LayoutDashboard, Users2, Kanban, CalendarCheck2, FileSignature,
  Megaphone, BarChart3, Settings2, FileText, BellRing, Search, LogOut,
  UserPlus, Building2, GitMerge, Globe2, ShieldCheck, Sparkles,
} from "lucide-react";

type Item = { to: string; label: string; icon: any };
const sections: { label: string; items: Item[] }[] = [
  { label: "Hiring", items: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/requisitions", label: "Requisitions", icon: Briefcase },
    { to: "/forecasts", label: "WG Forecasts", icon: Sparkles },
    { to: "/pipeline", label: "Pipeline", icon: Kanban },
    { to: "/candidates", label: "Candidates", icon: Users2 },
  ]},
  { label: "Process", items: [
    { to: "/interviews", label: "Interviews", icon: CalendarCheck2 },
    { to: "/offers", label: "Offers", icon: FileSignature },
    { to: "/background-checks", label: "Background Checks", icon: ShieldCheck },
    { to: "/conversion", label: "CoreHR Handoff", icon: GitMerge },
  ]},
  { label: "Sourcing", items: [
    { to: "/referrals", label: "Referrals", icon: UserPlus },
    { to: "/agencies", label: "Agencies", icon: Building2 },
    { to: "/careers", label: "Career Site", icon: Globe2 },
  ]},
  { label: "Insights", items: [
    { to: "/analytics", label: "Recruitment Analytics", icon: BarChart3 },
    { to: "/announcements", label: "TA Announcements", icon: Megaphone },
  ]},
  { label: "Administration", items: [
    { to: "/audit", label: "Audit Log", icon: FileText },
    { to: "/settings", label: "Settings", icon: Settings2 },
  ]},
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { location } = useRouterState();
  const path = location.pathname;
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md" style={{ background: "var(--gradient-primary)" }}>
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold tracking-tight text-sidebar-foreground">HireFlow</div>
            <div className="text-[10px] text-sidebar-muted uppercase tracking-wider font-medium">Talent Acquisition · v1.0</div>
          </div>
        </div>

        <nav className="flex-1 py-3 px-3 overflow-y-auto">
          {sections.map(sec => (
            <div key={sec.label}>
              <div className="nav-section-label">{sec.label}</div>
              <div className="space-y-0.5">
                {sec.items.map(({ to, label, icon: Icon }) => {
                  const active = to === "/" ? path === "/" : path.startsWith(to);
                  return (
                    <Link key={to} to={to} className={`nav-link group ${active ? "nav-link-active" : ""}`}>
                      <Icon className="nav-icon h-4 w-4 shrink-0 text-sidebar-muted transition-colors group-hover:text-sidebar-accent-foreground" />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1.5">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-sidebar-accent/60 border border-sidebar-border/50">
            <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-sm" style={{ background: "var(--gradient-primary)" }}>NH</div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate text-sidebar-foreground">Nora Haddad</div>
              <div className="text-[10px] text-sidebar-muted truncate">TA Lead · EMP-1007</div>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-sidebar-muted hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-colors">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto" style={{ background: "var(--gradient-hero)" }}>
        <div className="sticky top-0 z-10 backdrop-blur-md bg-background/70 border-b border-border">
          <div className="px-8 py-3 max-w-[1600px] mx-auto flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/50" placeholder="Search candidates, requisitions, jobs…" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link to="/conversion" className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded-md px-2 py-1">
                <GitMerge className="h-3 w-3" /> Connected to <span className="font-semibold text-foreground">CoreHR</span>
              </Link>
              <button className="relative h-9 w-9 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center">
                <BellRing className="h-4 w-4 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse-dot" />
              </button>
            </div>
          </div>
        </div>
        <div className="px-8 py-6 max-w-[1600px] mx-auto animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
