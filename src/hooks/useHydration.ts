import { useEffect, useState } from "react";
import { useTravelStore } from "@/store/travel";

/**
 * Returns `true` once the zustand persist middleware has finished
 * rehydrating from localStorage. During SSR / initial client hydration,
 * returns `false` so consuming components can skip rendering (or render
 * a placeholder) to avoid React hydration mismatches.
 */
export function useHydration(): boolean {
  const hydrated = useTravelStore((s) => s._hydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && hydrated;
}
