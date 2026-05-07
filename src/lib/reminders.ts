// Scheduled reminder system for adverse-action dispute windows.
// Runs in-browser; in production this lives in a cron worker.
import { backgroundChecks } from "./ta-data";
import { broadcastMilestone, notifications } from "./notifications";

export const REMINDER_LEAD_MS = 24 * 60 * 60 * 1000; // 24h before window ends
const TICK_MS = 60 * 1000; // check every minute (sim)
let timer: ReturnType<typeof setInterval> | null = null;
const fired = new Set<string>(); // dedupe per bgcId

function parseEndsAt(s?: string): number | null {
  if (!s) return null;
  // "YYYY-MM-DD HH:mm:ss"
  const iso = s.replace(" ", "T") + "Z";
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

export interface UpcomingReminder {
  bgcId: string; candidateName: string; reqId: string;
  endsAt: string; msUntilEnd: number; willNotifyAt: string; alreadySent: boolean;
}

export function scanUpcomingReminders(): UpcomingReminder[] {
  const out: UpcomingReminder[] = [];
  const now = Date.now();
  for (const b of backgroundChecks) {
    const aa = b.adverseAction; if (!aa || aa.decision || aa.disputed) continue;
    const endsAt = parseEndsAt(aa.disputeWindowEndsAt); if (!endsAt) continue;
    const msUntilEnd = endsAt - now;
    if (msUntilEnd <= 0) continue;
    out.push({
      bgcId: b.id, candidateName: b.candidateData.fullLegalName, reqId: b.reqId,
      endsAt: aa.disputeWindowEndsAt!, msUntilEnd,
      willNotifyAt: new Date(endsAt - REMINDER_LEAD_MS).toISOString().replace("T", " ").slice(0, 19),
      alreadySent: notifications.some(n => n.entity === "BackgroundCheck" && n.entityId === b.id && n.milestone === "DISPUTE_WINDOW_ENDING"),
    });
  }
  return out.sort((a, b) => a.msUntilEnd - b.msUntilEnd);
}

function tick() {
  const now = Date.now();
  for (const b of backgroundChecks) {
    const aa = b.adverseAction; if (!aa || aa.decision || aa.disputed) continue;
    const endsAt = parseEndsAt(aa.disputeWindowEndsAt); if (!endsAt) continue;
    const ms = endsAt - now;
    if (ms <= REMINDER_LEAD_MS && ms > 0 && !fired.has(b.id)) {
      fired.add(b.id);
      broadcastMilestone({
        milestone: "DISPUTE_WINDOW_ENDING",
        subject: `Dispute window closing in <24h — ${b.candidateData.fullLegalName}`,
        body: `BGC ${b.id} dispute window ends ${aa.disputeWindowEndsAt}. Recruiter/HR action required before final adverse decision can be issued.`,
        entity: "BackgroundCheck", entityId: b.id, candidateId: b.candidateId, reqId: b.reqId,
      });
    }
  }
}

export function fireReminderNow(bgcId: string) {
  const b = backgroundChecks.find(x => x.id === bgcId); if (!b || !b.adverseAction) return;
  fired.add(b.id);
  broadcastMilestone({
    milestone: "DISPUTE_WINDOW_ENDING",
    subject: `[Manual test] Dispute window closing — ${b.candidateData.fullLegalName}`,
    body: `BGC ${b.id} dispute window ends ${b.adverseAction.disputeWindowEndsAt}.`,
    entity: "BackgroundCheck", entityId: b.id, candidateId: b.candidateId, reqId: b.reqId,
  });
}

export function startReminderScheduler() {
  if (timer) return;
  timer = setInterval(tick, TICK_MS);
  tick();
}
export function stopReminderScheduler() { if (timer) { clearInterval(timer); timer = null; } }
