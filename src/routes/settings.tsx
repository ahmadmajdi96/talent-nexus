import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { Settings2, Shield, Globe2, Users } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings — HireFlow" },
    { name: "description", content: "Approval rules, integrations, role-based access, compliance policies." },
  ]}),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="Settings" description="Configure approval workflows, integrations, role permissions and compliance defaults." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card icon={<Users className="h-4 w-4" />} title="Roles & permissions">
          <Row label="TA Lead" value="Full admin · all requisitions" />
          <Row label="Recruiter" value="Read/Write on assigned reqs" />
          <Row label="Hiring Manager" value="Read/Write on own reqs · interviewer" />
          <Row label="Interviewer" value="Read-only on assigned candidates" />
          <Row label="Candidate" value="External career portal only" />
          <Row label="Employee (Referral)" value="Referral portal" />
        </Card>

        <Card icon={<Shield className="h-4 w-4" />} title="Compliance">
          <Row label="GDPR retention" value="12 months default · talent-pool opt-in extends" />
          <Row label="Anonymizer" value={<Pill tone="success">Enabled · monthly</Pill>} />
          <Row label="EEO/OFCCP" value="Anonymous mode + aggregate-only self-id reporting" />
          <Row label="Audit retention" value="7 years (immutable)" />
        </Card>

        <Card icon={<Globe2 className="h-4 w-4" />} title="Job board integrations">
          <Row label="LinkedIn" value={<Pill tone="success">Connected</Pill>} />
          <Row label="Indeed" value={<Pill tone="success">Connected</Pill>} />
          <Row label="Glassdoor" value={<Pill tone="success">Connected</Pill>} />
          <Row label="Internal career site" value={<Pill tone="success">Live</Pill>} />
          <Row label="Calendar (Zoom / Teams / Meet)" value={<Pill tone="success">Auto-create links</Pill>} />
        </Card>

        <Card icon={<Settings2 className="h-4 w-4" />} title="Approval workflows">
          <Row label="Requisition (≤ L4)" value="HM → Dept Head → Finance" />
          <Row label="Requisition (L5+)" value="HM → Dept Head → Finance → HR Director" />
          <Row label="Offer (in-band)" value="Comp → HR" />
          <Row label="Offer (out-of-band)" value="Comp → HR → CFO" />
        </Card>

        <Card icon={<Settings2 className="h-4 w-4" />} title="Connected systems">
          <Row label="CoreHR (employee provisioning)" value={<Pill tone="success">candidate.hired event flow</Pill>} />
          <Row label="WorkGrid (project staffing)" value={<Pill tone="success">project.staffing.forecast inbound</Pill>} />
          <Row label="Background check provider" value="Checkr · auto-trigger at OFFER stage" />
          <Row label="Assessment (HackerRank, Codility)" value={<Pill tone="info">Optional per req</Pill>} />
        </Card>

        <Card icon={<Shield className="h-4 w-4" />} title="Capacity">
          <Row label="Active candidates ceiling" value="10,000" />
          <Row label="Career site SLA" value="< 2s mobile load" />
          <Row label="Background check SLA" value="< 5 business days" />
        </Card>
      </div>
    </AppShell>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="page-section p-5">
      <div className="flex items-center gap-2 mb-3"><div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">{icon}</div><div className="font-semibold">{title}</div></div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
