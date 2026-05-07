// Role-based access (frontend gating; backend would mirror in real impl).
import { useSyncExternalStore } from "react";

export type Role = "TA_LEAD" | "RECRUITER" | "HIRING_MANAGER" | "INTERVIEWER";

export interface CurrentUser {
  id: string;
  name: string;
  role: Role;
}

const KEY = "corta.currentUser";

const DEFAULT: CurrentUser = { id: "EMP-1007", name: "Nora Haddad", role: "RECRUITER" };

const PRESETS: CurrentUser[] = [
  { id: "EMP-1007", name: "Nora Haddad", role: "RECRUITER" },
  { id: "EMP-1001", name: "Amina Al-Farsi", role: "TA_LEAD" },
  { id: "EMP-1004", name: "Marcus Lindberg", role: "HIRING_MANAGER" },
  { id: "EMP-1003", name: "Sarah Khan", role: "INTERVIEWER" },
];

let current: CurrentUser = (() => {
  if (typeof window === "undefined") return DEFAULT;
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch {}
  return DEFAULT;
})();

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const getSnapshot = () => current;
const getServerSnapshot = () => DEFAULT;

export function setCurrentUser(u: CurrentUser) {
  current = u;
  try { localStorage.setItem(KEY, JSON.stringify(u)); } catch {}
  listeners.forEach(l => l());
}
export function listUserPresets() { return PRESETS; }
export function useCurrentUser() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Capabilities matrix
export const CAN = {
  viewScorecards: (r: Role) => true,
  submitScorecard: (r: Role) => r === "INTERVIEWER" || r === "RECRUITER" || r === "HIRING_MANAGER" || r === "TA_LEAD",
  finalizeScorecard: (r: Role) => r === "INTERVIEWER" || r === "RECRUITER" || r === "TA_LEAD",
  // Recruiters can finalize scorecards but NOT record final hiring decisions
  recordHiringDecision: (r: Role) => r === "HIRING_MANAGER" || r === "TA_LEAD",
  manageBackgroundCheck: (r: Role) => r === "RECRUITER" || r === "TA_LEAD",
  decideAdverseAction: (r: Role) => r === "TA_LEAD" || r === "RECRUITER",
  exportAudit: (r: Role) => r === "TA_LEAD" || r === "RECRUITER",
  viewCandidatePII: (r: Role) => r !== "INTERVIEWER",
} as const;
