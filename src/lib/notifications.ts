// Multi-channel notification dispatch with retry handling.
// In a real backend this would be a queue + worker; here we simulate so the UI can show retries.
import { useSyncExternalStore } from "react";
import { isChannelEnabled } from "./notif-prefs";

export type Channel = "email" | "in_app" | "slack";
export type NotifStatus = "PENDING" | "SENT" | "RETRYING" | "FAILED";

export interface Notification {
  id: string;
  at: string;
  channel: Channel;
  to: string;
  subject: string;
  body: string;
  // linkage
  entity: "BackgroundCheck" | "Candidate" | "Requisition" | "Scorecard" | "Conversion" | "Interview";
  entityId: string;
  candidateId?: string;
  reqId?: string;
  // milestone for adverse action
  milestone?: "PRE_NOTICE" | "DISPUTE_LOGGED" | "DISPUTE_WINDOW_ENDING" | "FINAL_DECISION";
  status: NotifStatus;
  attempts: { at: string; status: number; error?: string }[];
}

const listeners = new Set<() => void>();
let version = 0;
const STORAGE_KEY = "corta.notifications.v1";

function loadPersisted(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Notification[];
    // Reset terminal "RETRYING" states left over from an unloaded page
    return arr.map(n => n.status === "RETRYING" ? { ...n, status: "FAILED" as NotifStatus } : n);
  } catch { return []; }
}
function persist() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 200))); } catch {}
}
const bump = () => { version++; persist(); listeners.forEach(l => l()); };
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const getSnap = () => version;
export const useNotifications = () => useSyncExternalStore(subscribe, getSnap, getSnap);

export const notifications: Notification[] = loadPersisted();

const nowIso = () => new Date().toISOString().replace("T", " ").slice(0, 19);
const newId = () => `NTF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

function simulateSend(channel: Channel): { status: number; error?: string } {
  // Simulated transient failures: ~25% on first attempt
  const ok = Math.random() > 0.25;
  if (ok) return { status: 200 };
  if (channel === "slack") return { status: 503, error: "slack rate limit" };
  if (channel === "email") return { status: 502, error: "smtp gateway timeout" };
  return { status: 500, error: "in-app push failed" };
}

export function dispatchNotification(input: Omit<Notification, "id" | "at" | "status" | "attempts">) {
  const n: Notification = { ...input, id: newId(), at: nowIso(), status: "PENDING", attempts: [] };
  notifications.unshift(n);
  attempt(n);
  bump();
  return n;
}

function attempt(n: Notification) {
  const r = simulateSend(n.channel);
  n.attempts.push({ at: nowIso(), status: r.status, error: r.error });
  if (r.status >= 200 && r.status < 300) { n.status = "SENT"; bump(); return; }
  if (n.attempts.length < 3) {
    n.status = "RETRYING";
    bump();
    // exponential backoff (sim): 400ms, 1.2s
    const delay = 400 * Math.pow(3, n.attempts.length - 1);
    setTimeout(() => attempt(n), delay);
  } else {
    n.status = "FAILED";
    bump();
  }
}

export function retryNotification(id: string) {
  const n = notifications.find(x => x.id === id);
  if (!n) return;
  if (n.attempts.length >= 5) return;
  n.status = "RETRYING";
  attempt(n);
}

// Convenience: dispatch the same milestone over email + in-app + slack
export function broadcastMilestone(opts: {
  milestone: NonNullable<Notification["milestone"]>;
  subject: string;
  body: string;
  entity: Notification["entity"];
  entityId: string;
  candidateId?: string;
  reqId?: string;
  recipientEmail?: string;
  recipientUserId?: string;
  slackChannel?: string;
}) {
  const base = {
    milestone: opts.milestone, subject: opts.subject, body: opts.body,
    entity: opts.entity, entityId: opts.entityId,
    candidateId: opts.candidateId, reqId: opts.reqId,
  };
  if (isChannelEnabled("email")) dispatchNotification({ ...base, channel: "email", to: opts.recipientEmail ?? "nora.haddad@coreflow.com" });
  if (isChannelEnabled("in_app")) dispatchNotification({ ...base, channel: "in_app", to: opts.recipientUserId ?? "EMP-1007" });
  if (isChannelEnabled("slack")) dispatchNotification({ ...base, channel: "slack", to: opts.slackChannel ?? "#hireflow-alerts" });
}

export function notificationsByEntity(entity: Notification["entity"], entityId: string) {
  return notifications.filter(n => n.entity === entity && n.entityId === entityId);
}
