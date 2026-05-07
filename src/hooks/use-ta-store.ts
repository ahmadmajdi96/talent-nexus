import { useSyncExternalStore } from "react";
import { subscribe, getSnapshot } from "@/lib/ta-data";
export function useTAStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
