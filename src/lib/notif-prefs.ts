// User-managed notification preferences (persisted).
import { useSyncExternalStore } from "react";
import type { Role } from "./role";
import type { Channel } from "./notifications";

export interface NotifPrefs {
  channels: Record<Channel, boolean>;
  // Hours before dispute window end at which to fire reminders, per role.
  reminderLeadHoursByRole: Record<Role, number>;
}

const KEY = "corta.notifPrefs.v1";

const DEFAULT: NotifPrefs = {
  channels: { email: true, in_app: true, slack: true },
  reminderLeadHoursByRole: {
    TA_LEAD: 48,
    RECRUITER: 24,
    HIRING_MANAGER: 12,
    INTERVIEWER: 6,
  },
};

let prefs: NotifPrefs = (() => {
  if (typeof window === "undefined") return DEFAULT;
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...DEFAULT, ...JSON.parse(raw) }; } catch {}
  return DEFAULT;
})();

const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const getSnapshot = () => prefs;
const getServerSnapshot = () => DEFAULT;

export function getNotifPrefs() { return prefs; }
export function setNotifPrefs(next: NotifPrefs) {
  prefs = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  notify();
}
export function setChannelEnabled(c: Channel, enabled: boolean) {
  setNotifPrefs({ ...prefs, channels: { ...prefs.channels, [c]: enabled } });
}
export function setReminderLead(role: Role, hours: number) {
  setNotifPrefs({ ...prefs, reminderLeadHoursByRole: { ...prefs.reminderLeadHoursByRole, [role]: hours } });
}
export function reminderLeadMsForRole(role: Role) {
  return (prefs.reminderLeadHoursByRole[role] ?? 24) * 3_600_000;
}
export function isChannelEnabled(c: Channel) { return prefs.channels[c] !== false; }
export function useNotifPrefs() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
