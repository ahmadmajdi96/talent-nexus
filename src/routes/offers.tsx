import { createFileRoute, Link } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { Avatar } from "@/components/Avatar";
import { offers, candidateById, reqById } from "@/lib/ta-data";
import { CheckCircle2, Circle, Clock, FileSignature } from "lucide-react";

export const Route = createFileRoute("/offers")({
  head: () => ({ meta: [
    { title: "Offers — CORTA Acquisition" },
    { name: "description", content: "Generate offers from approved templates, route for compensation/HR/Finance approval, send for digital signature." },
  ]}),
  component: OffersPage,
});

const tone: any = { ACCEPTED: "success", SENT: "info", PENDING_APPROVAL: "warning", DRAFT: "muted", REJECTED: "destructive", EXPIRED: "muted" };

function OffersPage() {
  return (
    <AppShell>
      <PageHeader
        title="Offers"
        description="Pre-approved templates, salary band guardrails from CoreHR, multi-step approvals and digital signature."
        actions={<button className="inline-flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-md bg-primary text-primary-foreground hover:opacity-90"><FileSignature className="h-4 w-4" /> Draft offer</button>}
      />
      <div className="space-y-3">
        {offers.map(o => {
          const c = candidateById(o.candidateId)!;
          const r = reqById(o.reqId)!;
          return (
            <div key={o.id} className="page-section p-4 grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 items-center">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={`${c.firstName} ${c.lastName}`} size={40} />
                <div className="min-w-0">
                  <Link to="/candidates/$id" params={{ id: c.id }} className="font-semibold hover:text-primary block truncate">{c.firstName} {c.lastName}</Link>
                  <div className="text-xs text-muted-foreground truncate"><span className="font-mono">{o.id}</span> · {r.title}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <KV label="Base" value={`${o.baseSalary.toLocaleString()} ${o.currency}`} />
                <KV label="Bonus" value={`${o.bonusPct}%`} />
                <KV label="Equity" value={o.equity ?? "—"} />
                <KV label="Start" value={o.startDate} />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Pill tone={tone[o.status]}>{o.status.replace("_"," ")}</Pill>
                <div className="flex items-center gap-1.5">
                  {o.approvals.map((a, i) => (
                    <div key={i} title={`${a.role}: ${a.name}`}>
                      {a.status === "APPROVED" ? <CheckCircle2 className="h-4 w-4 text-success" /> : a.status === "REJECTED" ? <Circle className="h-4 w-4 text-destructive" /> : <Clock className="h-4 w-4 text-warning" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-medium mt-0.5 truncate">{value}</div>
    </div>
  );
}
