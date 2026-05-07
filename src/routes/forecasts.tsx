import { createFileRoute, useNavigate } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { staffingForecasts, requisitions, createRequisitionFromForecast } from "@/lib/ta-data";
import { useTAStore } from "@/hooks/use-ta-store";
import { Sparkles, ArrowRight, Calendar, Briefcase, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/forecasts")({
  head: () => ({ meta: [
    { title: "WorkGrid Forecasts — CORTA Acquisition" },
    { name: "description", content: "Inbound project staffing forecasts from WorkGrid. Convert to requisitions in one click." },
  ]}),
  component: ForecastsPage,
});

const priorityTone = { HIGH: "destructive", MEDIUM: "warning", LOW: "muted" } as const;

function ForecastsPage() {
  useTAStore();
  const navigate = useNavigate();

  const convert = (id: string) => {
    const r = createRequisitionFromForecast(id);
    if (!r) return;
    toast.success(`Created ${r.id}`, { description: "Pre-populated from WorkGrid forecast." });
    navigate({ to: "/requisitions/$id", params: { id: r.id } });
  };

  const open = staffingForecasts.filter(f => !f.linkedReqId);
  const linked = staffingForecasts.filter(f => f.linkedReqId);

  return (
    <AppShell>
      <PageHeader
        title={<span className="flex items-center gap-3">WorkGrid Forecasts <Pill tone="accent"><Sparkles className="h-3 w-3" /> Inbound</Pill></span>}
        description="Anticipated resource needs pushed from WorkGrid project planning. Use these to prioritize new requisitions before demand becomes urgent."
      />

      <div className="page-section p-4 mb-6 border-l-4 border-l-info bg-info/5 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-info shrink-0 mt-0.5" />
        <div className="text-sm">
          <div className="font-semibold mb-0.5">Integration: <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">project.staffing.forecast</code></div>
          <div className="text-xs text-muted-foreground">When you click "Create requisition", role, skills, target start date, and recommended priority are pre-populated. The new requisition is auto-linked back to the forecast so WorkGrid can track resourcing progress.</div>
        </div>
      </div>

      <div className="font-semibold text-sm mb-2">Open forecasts ({open.length})</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {open.map(f => (
          <div key={f.id} className="page-section p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="text-xs font-mono text-muted-foreground">{f.id}</div>
                <div className="font-semibold mt-0.5">{f.role}</div>
                <div className="text-xs text-muted-foreground">Project: {f.project}</div>
              </div>
              <Pill tone={priorityTone[f.priority]}>{f.priority}</Pill>
            </div>
            <div className="flex flex-wrap gap-1.5 my-2">
              {f.skills.map(s => <Pill key={s} tone="primary">{s}</Pill>)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> Start {f.estStart}</span>
              <span>·</span>
              <span>{f.durationMonths} months</span>
            </div>
            <button onClick={() => convert(f.id)} className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium">
              <Briefcase className="h-4 w-4" /> Create requisition <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
        {open.length === 0 && <div className="text-sm text-muted-foreground py-6">No open forecasts.</div>}
      </div>

      <div className="font-semibold text-sm mb-2">Already linked ({linked.length})</div>
      <div className="page-section overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Forecast</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Linked requisition</th>
              <th className="text-left p-3">Priority</th>
            </tr>
          </thead>
          <tbody>
            {linked.map(f => {
              const r = requisitions.find(x => x.id === f.linkedReqId);
              return (
                <tr key={f.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{f.id}</td>
                  <td className="p-3">{f.role}<div className="text-xs text-muted-foreground">{f.project}</div></td>
                  <td className="p-3 text-xs">{r ? <span className="font-mono">{r.id}</span> : f.linkedReqId} — {r?.title}</td>
                  <td className="p-3"><Pill tone={priorityTone[f.priority]}>{f.priority}</Pill></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
