import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { useNotifPrefs, setChannelEnabled, setReminderLead } from "@/lib/notif-prefs";
import type { Channel } from "@/lib/notifications";
import type { Role } from "@/lib/role";
import { Mail, MessageSquare, Smartphone, Bell, AlarmClock } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/notifications-settings")({
  head: () => ({ meta: [
    { title: "Notification Settings — CORTA Acquisition" },
    { name: "description", content: "Manage email, in-app and Slack notification channels and reminder lead times by role." },
  ]}),
  component: NotificationsSettings,
});

const CHANNELS: { key: Channel; label: string; icon: any; description: string }[] = [
  { key: "email", label: "Email", icon: Mail, description: "FCRA milestones and dispute window alerts via SMTP." },
  { key: "in_app", label: "In-app", icon: Smartphone, description: "Push notifications inside CORTA Acquisition and CoreFlow Nexus." },
  { key: "slack", label: "Slack", icon: MessageSquare, description: "Posts to #hireflow-alerts (and recruiter DMs)." },
];

const ROLES: Role[] = ["TA_LEAD", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER"];

function NotificationsSettings() {
  const prefs = useNotifPrefs();

  return (
    <AppShell>
      <PageHeader
        title={<span className="flex items-center gap-3">Notification Settings <Pill tone="primary"><Bell className="h-3 w-3" /> Per-channel · per-role</Pill></span>}
        description="Toggle delivery channels and adjust how early dispute-window reminders fire for each role."
      />

      <div className="page-section p-5 mb-5">
        <div className="font-semibold mb-1">Delivery channels</div>
        <div className="text-xs text-muted-foreground mb-4">Disabling a channel pauses dispatch immediately — already-queued notifications continue retrying.</div>
        <div className="space-y-3">
          {CHANNELS.map(({ key, label, icon: Icon, description }) => (
            <div key={key} className="flex items-center gap-4 rounded-md border border-border p-3">
              <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><Icon className="h-4 w-4" /></div>
              <div className="flex-1">
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
              </div>
              <Pill tone={prefs.channels[key] ? "success" : "muted"}>{prefs.channels[key] ? "Enabled" : "Off"}</Pill>
              <Switch checked={prefs.channels[key]} onCheckedChange={v => setChannelEnabled(key, v)} />
            </div>
          ))}
        </div>
      </div>

      <div className="page-section p-5">
        <div className="flex items-center gap-2 mb-1">
          <AlarmClock className="h-4 w-4 text-warning" />
          <div className="font-semibold">Dispute-window reminder lead time (per role)</div>
        </div>
        <div className="text-xs text-muted-foreground mb-4">How many hours before a candidate's adverse-action dispute window closes the role gets reminded.</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ROLES.map(r => {
            const v = prefs.reminderLeadHoursByRole[r];
            return (
              <div key={r} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">{r.replace("_", " ")}</div>
                  <span className="font-mono text-xs tabular-nums">{v}h</span>
                </div>
                <input type="range" min={1} max={120} step={1} value={v}
                  onChange={e => setReminderLead(r, Number(e.target.value))}
                  className="w-full accent-primary" />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>1h</span><span>5d</span></div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
