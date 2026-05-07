import { createFileRoute, Link } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { Avatar } from "@/components/Avatar";
import { referrals, candidateById, reqById } from "@/lib/ta-data";
import { UserPlus, Award } from "lucide-react";

export const Route = createFileRoute("/referrals")({
  head: () => ({ meta: [
    { title: "Referrals — CORTA Acquisition" },
    { name: "description", content: "Employee referrals and bonus eligibility tracking." },
  ]}),
  component: ReferralsPage,
});

const tone: any = { ELIGIBLE: "success", PAID: "primary", PENDING: "warning", INELIGIBLE: "muted" };

function ReferralsPage() {
  const total = referrals.reduce((sum, r) => sum + (r.status === "PAID" || r.status === "ELIGIBLE" ? r.bonusAmount : 0), 0);
  return (
    <AppShell>
      <PageHeader
        title="Employee Referrals"
        description="Each employee in CoreHR has a unique referral link per requisition. Bonus eligibility unlocks once the candidate clears probation."
        actions={<button className="inline-flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-md bg-primary text-primary-foreground hover:opacity-90"><UserPlus className="h-4 w-4" /> Submit referral</button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card"><div className="stat-label mb-2">Active referrals</div><div className="text-3xl font-bold tabular-nums">{referrals.length}</div></div>
        <div className="stat-card"><div className="stat-label mb-2">Eligible bonus pool</div><div className="text-3xl font-bold tabular-nums">{total.toLocaleString()} <span className="text-sm text-muted-foreground">mixed currency</span></div></div>
        <div className="stat-card"><div className="stat-label mb-2">Top referrer</div><div className="text-base font-semibold mt-1">Sarah Khan · EMP-1003</div><div className="text-xs text-muted-foreground">2 referrals this quarter</div></div>
      </div>

      <div className="page-section overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Referral</th>
              <th className="text-left p-3">Referrer</th>
              <th className="text-left p-3">Candidate</th>
              <th className="text-left p-3">Requisition</th>
              <th className="text-right p-3">Bonus</th>
              <th className="text-right p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map(r => {
              const c = candidateById(r.candidateId);
              const req = reqById(r.reqId);
              return (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{r.id}<div className="text-[10px] text-muted-foreground">{r.submittedAt}</div></td>
                  <td className="p-3"><div className="flex items-center gap-2"><Avatar name={r.referrerName} size={28} /><div className="text-xs"><div className="font-medium">{r.referrerName}</div><div className="font-mono text-muted-foreground">{r.referrerEmployeeId}</div></div></div></td>
                  <td className="p-3 text-xs">{c && <Link to="/candidates/$id" params={{ id: c.id }} className="hover:text-primary font-medium">{c.firstName} {c.lastName}</Link>}</td>
                  <td className="p-3 text-xs">{req?.title} <span className="text-muted-foreground font-mono block">{r.reqId}</span></td>
                  <td className="p-3 text-right tabular-nums text-sm">{r.bonusAmount.toLocaleString()} {r.currency}</td>
                  <td className="p-3 text-right"><Pill tone={tone[r.status]}><Award className="h-3 w-3" /> {r.status}</Pill></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
