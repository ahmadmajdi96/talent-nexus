// Scheduled reminder system for adverse-action dispute windows.
// Persists "fired" state across reloads.
import { backgroundChecks } from "./ta-data";
import { broadcastMilestone, notifications } from "./notifications";
import { reminderLeadMsForRole } from "./notif-prefs";
import type { Role } from "./role";

export const REMINDER_LEAD_MS_DEFAULT = 24 * 60 * 60 * 1000;
const TICK_MS = 60 * 1000;
const FIRED_KEY = "hireflow.reminders.fired.v1";

let timer: ReturnType<typeof setInterval> | null = null;

function loadFired(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { const raw = localStorage.getItem(FIRED_KEY); return new Set(raw ? JSON.parse(raw) : []); } catch { return new Set(); }
}
function saveFired(s: Set<string>) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(FIRED_KEY, JSON.stringify([...s])); } catch {}
}
const fired = loadFired();

function parseEndsAt(s?: string): number | null {
  if (!s) return null;
  const iso = s.replace(" ", "T") + "Z";
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

export interface UpcomingReminder {
  bgcId: string; candidateName: string; reqId: string;
  endsAt: string; msUntilEnd: number; willNotifyAt: string; alreadySent: boolean;
  leadMs: number;
}

export function scanUpcomingReminders(role: Role = "RECRUITER"): UpcomingReminder[] {
  const out: UpcomingReminder[] = [];
  const now = Date.now();
  const leadMs = reminderLeadMsForRole(role);
  for (const b of backgroundChecks) {
    const aa = b.adverseAction; if (!aa || aa.decision || aa.disputed) continue;
    const endsAt = parseEndsAt(aa.disputeWindowEndsAt); if (!endsAt) continue;
    const msUntilEnd = endsAt - now;
    if (msUntilEnd <= 0) continue;
    out.push({
      bgcId: b.id, candidateName: b.candidateData.fullLegalName, reqId: b.reqId,
      endsAt: aa.disputeWindowEndsAt!, msUntilEnd,
      willNotifyAt: new Date(endsAt - leadMs).toISOString().replace("T", " ").slice(0, 19),
      alreadySent: fired.has(b.id) || notifications.some(n => n.entity === "BackgroundCheck" && n.entityId === b.id && n.milestone === "DISPUTE_WINDOW_ENDING"),
      leadMs,
    });
  }
  return out.sort((a, b) => a.msUntilEnd - b.msUntilEnd);
}

function tick() {
  const now = Date.now();
  const leadMs = reminderLeadMsForRole("RECRUITER");
  for (const b of backgroundChecks) {
    const aa = b.adverseAction; if (!aa || aa.decision || aa.disputed) continue;
    const endsAt = parseEndsAt(aa.disputeWindowEndsAt); if (!endsAt) continue;
    const ms = endsAt - now;
    if (ms <= leadMs && ms > 0 && !fired.has(b.id)) {
      fired.add(b.id); saveFired(fired);
      broadcastMilestone({
        milestone: "DISPUTE_WINDOW_ENDING",
        subject: `Dispute window closing in <${Math.round(leadMs / 3_600_000)}h — ${b.candidateData.fullLegalName}`,
        body: `BGC ${b.id} dispute window ends ${aa.disputeWindowEndsAt}.`,
        entity: "BackgroundCheck", entityId: b.id, candidateId: b.candidateId, reqId: b.reqId,
      });
    }
  }
}

export function fireReminderNow(bgcId: string) {
  const b = backgroundChecks.find(x => x.id === bgcId); if (!b || !b.adverseAction) return;
  fired.add(b.id); saveFired(fired);
  broadcastMilestone({
    milestone: "DISPUTE_WINDOW_ENDING",
    subject: `[Manual] Dispute window closing — ${b.candidateData.fullLegalName}`,
    body: `BGC ${b.id} dispute window ends ${b.adverseAction.disputeWindowEndsAt}.`,
    entity: "BackgroundCheck", entityId: b.id, candidateId: b.candidateId, reqId: b.reqId,
  });
}

export function clearReminderState(bgcId?: string) {
  if (bgcId) fired.delete(bgcId); else fired.clear();
  saveFired(fired);
}

export function startReminderScheduler() {
  if (timer) return;
  timer = setInterval(tick, TICK_MS);
  tick();
}
export function stopReminderScheduler() { if (timer) { clearInterval(timer); timer = null; } }

// Backwards-compat alias for old code paths
export const REMINDER_LEAD_MS = REMINDER_LEAD_MS_DEFAULT;
