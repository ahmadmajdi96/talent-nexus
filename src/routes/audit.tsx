import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { auditLog } from "@/lib/ta-data";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [
    { title: "Audit Log — HireFlow" },
    { name: "description", content: "Append-only audit trail for every requisition, candidate, scorecard, offer and CoreHR conversion event." },
  ]}),
  component: AuditPage,
});

function AuditPage() {
  return (
    <AppShell>
      <PageHeader title="Audit Log" description="Tamper-evident audit trail. Retained 7 years for SOX/GDPR/EEO compliance." />
      <div className="page-section overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">When</th>
              <th className="text-left p-3">Entity</th>
              <th className="text-left p-3">Action</th>
              <th className="text-left p-3">Actor</th>
              <th className="text-left p-3">Detail</th>
            </tr>
          </thead>
          <tbody>
            {auditLog.map(l => (
              <tr key={l.id} className="border-t border-border">
                <td className="p-3 text-xs tabular-nums text-muted-foreground">{l.at}</td>
                <td className="p-3 text-xs"><div className="font-medium">{l.entity}</div><div className="font-mono text-muted-foreground">{l.entityId}</div></td>
                <td className="p-3"><Pill tone={l.action === "ACCEPTED" || l.action === "EVENT_SENT" ? "success" : l.action === "PUBLISHED" ? "primary" : "info"}>{l.action.replace("_"," ")}</Pill></td>
                <td className="p-3 text-xs">{l.actor}</td>
                <td className="p-3 text-xs">{l.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
