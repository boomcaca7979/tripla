import { create } from "zustand";
import { trackEvent } from "@/lib/analytics";
import type { Vibe } from "@/lib/inner-state";

/**
 * atlas-store — World Atlas 的共享交互状态（STEP 2A/2B）。
 *
 * VIBE LENS：WorldAtlas 节点（/destinations hub）客户端岛内共用。
 * COMPARE：从 Preview 添加（≤3），compare tray / curves 消费。
 * 两个 client island 之间通过本 store 共享，页面主体保持 Server Component。
 *
 * 注意：vibe 同时被 sessionStorage 持久化（WorldAtlas 内），跨会话恢复。
 */

const COMPARE_MAX = 3;

interface AtlasState {
  /** null = ALL（世界完整，无 lens） */
  vibe: Vibe | null;
  setVibe: (vibe: Vibe | null) => void;
  /** compare 名单（slug，最多 3） */
  compare: string[];
  addToCompare: (slug: string) => "added" | "exists" | "full";
  removeFromCompare: (slug: string) => void;
  clearCompare: () => void;
}

export const useAtlasStore = create<AtlasState>((set, get) => ({
  vibe: null,
  setVibe: (vibe) => set({ vibe }),
  compare: [],
  addToCompare: (slug) => {
    const { compare } = get();
    if (compare.includes(slug)) return "exists";
    if (compare.length >= COMPARE_MAX) return "full";
    set({ compare: [...compare, slug] });
    trackEvent({ name: "destination_compare_add", destination: slug, compare_count: compare.length + 1 });
    return "added";
  },
  removeFromCompare: (slug) =>
    set((state) => {
      const next = state.compare.filter((s) => s !== slug);
      trackEvent({ name: "destination_compare_remove", destination: slug, compare_count: next.length });
      return { compare: next };
    }),
  clearCompare: () => set({ compare: [] }),
}));

export { COMPARE_MAX };
