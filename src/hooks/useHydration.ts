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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR 安全的 mounted 标志（React 官方 hydration 模式）
    setMounted(true);
  }, []);

  return mounted && hydrated;
}
