// Lightweight mock auth for CORTA Acquisition (frontend-only, demo).
import { useSyncExternalStore } from "react";

export interface AuthSession {
  email: string;
  name: string;
  loggedInAt: string;
}

const KEY = "corta.auth.session";

let session: AuthSession | null = (() => {
  if (typeof window === "undefined") return null;
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch {}
  return null;
})();

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const getSnapshot = () => session;
const getServerSnapshot = () => null;

export function useAuthSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function signIn(email: string, password: string): AuthSession {
  if (!email || !password || password.length < 4) throw new Error("Enter an email and a password (min 4 chars).");
  const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "User";
  const s: AuthSession = { email, name, loggedInAt: new Date().toISOString() };
  session = s;
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  listeners.forEach(l => l());
  return s;
}

export function signOut() {
  session = null;
  try { localStorage.removeItem(KEY); } catch {}
  listeners.forEach(l => l());
}
