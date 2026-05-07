import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Pill } from "@/components/StatusPill";
import { notifications, retryNotification, useNotifications } from "@/lib/notifications";
import { scanUpcomingReminders, startReminderScheduler, fireReminderNow } from "@/lib/reminders";
import { useCurrentUser } from "@/lib/role";
import { reminderLeadMsForRole, useNotifPrefs } from "@/lib/notif-prefs";
import { useTAStore } from "@/hooks/use-ta-store";
import { Bell, Mail, MessageSquare, Smartphone, RefreshCw, Clock, AlarmClock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [
    { title: "Notifications & Reminders — CORTA Acquisition" },
    { name: "description", content: "Multi-channel notification log and dispute-window reminder scheduler." },
  ]}),
  component: NotificationsPage,
});

const channelIcon = { email: Mail, in_app: Smartphone, slack: MessageSquare } as const;

function NotificationsPage() {
  useTAStore();
  useNotifications();
  useNotifPrefs();
  const me = useCurrentUser();
  useEffect(() => { startReminderScheduler(); }, []);
  const leadMs = reminderLeadMsForRole(me.role);
  const upcoming = scanUpcomingReminders(me.role);

  return (
    <AppShell>
      <PageHeader
        title={<span className="flex items-center gap-3">Notifications &amp; Reminders <Pill tone="primary"><Bell className="h-3 w-3" /> 3 channels</Pill></span>}
        description="Email, in-app and Slack delivery for every adverse-action milestone, with automatic retry on transient failures."
      />

      <div className="page-section p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <AlarmClock className="h-4 w-4 text-warning" />
          <div className="font-semibold">Scheduled dispute-window reminders</div>
          <span className="text-xs text-muted-foreground ml-auto">Auto-fires {Math.round(leadMs / 3_600_000)}h before window closes ({me.role.replace("_"," ")})</span>
        </div>
        {upcoming.length === 0 && <div className="text-xs text-muted-foreground">No open adverse-action dispute windows.</div>}
        <div className="space-y-2">
          {upcoming.map(u => (
            <div key={u.bgcId} className="rounded-md border border-border p-3 flex items-center gap-3 text-xs">
              <Clock className="h-4 w-4 text-warning shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-sm">{u.candidateName} <span className="text-muted-foreground font-mono">· {u.bgcId}</span></div>
                <div className="text-muted-foreground">Window ends <span className="font-mono">{u.endsAt}</span> · reminder fires <span className="font-mono">{u.willNotifyAt}</span></div>
              </div>
              <div className="text-muted-foreground tabular-nums">{formatDuration(u.msUntilEnd)}</div>
              {u.alreadySent
                ? <Pill tone="success">Reminder sent</Pill>
                : <button onClick={() => { fireReminderNow(u.bgcId); toast.success("Reminder fired"); }} className="text-xs px-3 h-8 rounded-md border border-border bg-card hover:bg-muted">Fire now</button>}
              <Link to="/background-checks" className="text-primary text-xs hover:underline">Open →</Link>
            </div>
          ))}
        </div>
      </div>

      <div className="page-section overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <div className="font-semibold text-sm">Notification log</div>
          <span className="text-xs text-muted-foreground ml-auto">{notifications.length} dispatched</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left p-3">When</th><th className="text-left p-3">Channel</th><th className="text-left p-3">Milestone</th><th className="text-left p-3">Subject</th><th className="text-left p-3">To</th><th className="text-left p-3">Status</th><th className="text-left p-3">Attempts</th><th></th></tr>
          </thead>
          <tbody>
            {notifications.map(n => {
              const Icon = channelIcon[n.channel];
              return (
                <tr key={n.id} className="border-t border-border align-top">
                  <td className="p-3 text-xs tabular-nums text-muted-foreground">{n.at}</td>
                  <td className="p-3 text-xs"><span className="inline-flex items-center gap-1.5"><Icon className="h-3 w-3" />{n.channel}</span></td>
                  <td className="p-3 text-xs">{n.milestone ? <Pill tone="info">{n.milestone.replace(/_/g, " ")}</Pill> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="p-3 text-xs"><div className="font-medium">{n.subject}</div><div className="text-muted-foreground line-clamp-1">{n.body}</div></td>
                  <td className="p-3 text-xs font-mono">{n.to}</td>
                  <td className="p-3"><Pill tone={n.status === "SENT" ? "success" : n.status === "FAILED" ? "destructive" : "warning"}>{n.status}</Pill></td>
                  <td className="p-3 text-xs">
                    {n.attempts.map((a, i) => (
                      <div key={i} className="font-mono text-[10px]"><span className={a.status < 300 ? "text-success" : "text-destructive"}>{a.status}</span> {a.error ? <span className="text-muted-foreground">· {a.error}</span> : ""}</div>
                    ))}
                  </td>
                  <td className="p-3">
                    {n.status === "FAILED" && <button onClick={() => { retryNotification(n.id); toast.success("Retry queued"); }} className="text-xs inline-flex items-center gap-1 px-2 h-7 rounded-md border border-border bg-card hover:bg-muted"><RefreshCw className="h-3 w-3" /> Retry</button>}
                  </td>
                </tr>
              );
            })}
            {notifications.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-xs text-muted-foreground">No notifications dispatched yet — trigger an adverse-action milestone from /background-checks.</td></tr>}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

function formatDuration(ms: number) {
  const h = Math.floor(ms / 3_600_000); const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h/24)}d ${h%24}h`;
  return `${h}h ${m}m`;
}
