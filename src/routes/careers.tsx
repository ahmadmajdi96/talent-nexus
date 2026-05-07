import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { requisitions } from "@/lib/ta-data";
import { Globe2, MapPin, ExternalLink, Smartphone, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/careers")({
  head: () => ({ meta: [
    { title: "Career Site — CORTA Acquisition" },
    { name: "description", content: "Public-facing job listings, mobile-responsive application flow, GDPR cookie consent." },
  ]}),
  component: CareersPage,
});

function CareersPage() {
  const live = requisitions.filter(r => r.postings.some(p => p.live && p.board === "Internal"));
  return (
    <AppShell>
      <PageHeader
        title="Career Site"
        description="careers.coreflow.com — mobile-responsive, GDPR-compliant, indexed for SEO. Single-click apply."
        actions={<a href="#" className="inline-flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-md border border-border bg-card hover:bg-muted">View public site <ExternalLink className="h-4 w-4" /></a>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Stat icon={<Globe2 className="h-4 w-4" />} label="Live job posts" value={live.length.toString()} />
        <Stat icon={<Smartphone className="h-4 w-4" />} label="Page load (mobile)" value="1.2s" />
        <Stat icon={<ShieldCheck className="h-4 w-4" />} label="GDPR consent rate" value="94%" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {live.map(r => (
          <div key={r.id} className="page-section p-5 hover-lift">
            <div className="flex items-center gap-2 mb-2">
              <Pill tone="success">Now hiring</Pill>
              <Pill tone="muted">{r.employmentType.replace("_"," ")}</Pill>
            </div>
            <div className="text-lg font-semibold">{r.title}</div>
            <div className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.location}, {r.country} · {r.department}</div>
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{r.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">{r.skills.slice(0,4).map(s => <Pill key={s} tone="primary">{s}</Pill>)}</div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-muted-foreground">Posted {r.openedAt}</div>
              <button className="text-xs font-medium px-3 h-8 rounded-md bg-primary text-primary-foreground hover:opacity-90">Apply now</button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2"><div className="stat-label">{label}</div><div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">{icon}</div></div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
