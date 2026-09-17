"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadTripList,
  makeTripItemId,
  saveTripList,
  type TripItem,
  type TripItemType,
} from "@/lib/trip-list";

/**
 * MyTripContext — Destination 城市页的旅行清单状态。
 *
 * · localStorage 持久化（key: utripla-trip-<slug>），组件重渲染/回访不丢。
 * · SSR 首帧渲染空清单（hydration 后回填），避免 watermark 不一致。
 * · 绝不自动添加条目；预算合计只累计带真实价格的条目（见 MyTripPanel）。
 * · dailyBudget 仅作为 AI 规划输入参考（budgetLevel），不渲染为 trip total。
 */

export interface MyTripContextValue {
  slug: string;
  city: string;
  items: TripItem[];
  days: number;
  hydrated: boolean;
  has: (type: TripItemType, name: string) => boolean;
  toggle: (item: Omit<TripItem, "id">) => void;
  add: (item: Omit<TripItem, "id">) => void;
  addMany: (items: Omit<TripItem, "id">[]) => void;
  remove: (id: string) => void;
  clear: () => void;
  setDays: (days: number) => void;
  /** 城市每日真实预算（budgetPerDay / budgetCurrency，来自 Destination 数据）。 */
  dailyBudget: { amount: number; currency: string };
}

const MyTripContext = createContext<MyTripContextValue | null>(null);

export function MyTripProvider({
  slug,
  city,
  defaultDays,
  dailyBudget,
  children,
}: {
  slug: string;
  city: string;
  defaultDays: number;
  dailyBudget: { amount: number; currency: string };
  children: ReactNode;
}) {
  const [items, setItems] = useState<TripItem[]>([]);
  const [days, setDaysState] = useState(defaultDays);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadTripList(slug);
    if (saved) {
      // 必须在 effect 内同步回填：SSR 首帧刻意渲染空清单，hydration 后才能
      // 读 localStorage，否则两端 DOM 不一致导致 hydration 报错（刻意豁免）。
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setItems(saved.items.filter((i) => i && i.id && i.name));
      setDaysState(Math.min(Math.max(Math.round(saved.days), 1), 14));
    }
    setHydrated(true);
  }, [slug]);

  useEffect(() => {
    if (!hydrated) return;
    saveTripList(slug, { items, days });
  }, [slug, items, days, hydrated]);

  const has = useCallback(
    (type: TripItemType, name: string) =>
      items.some((i) => i.id === makeTripItemId(type, name)),
    [items],
  );

  const add = useCallback(
    (item: Omit<TripItem, "id">) => {
      const withId: TripItem = { ...item, id: makeTripItemId(item.type, item.name) };
      setItems((prev) =>
        prev.some((i) => i.id === withId.id) ? prev : [...prev, withId],
      );
    },
    [],
  );

  const addMany = useCallback((next: Omit<TripItem, "id">[]) => {
    setItems((prev) => {
      const ids = new Set(prev.map((i) => i.id));
      const additions = next
        .map((item) => ({ ...item, id: makeTripItemId(item.type, item.name) }))
        .filter((item) => !ids.has(item.id));
      return additions.length > 0 ? [...prev, ...additions] : prev;
    });
  }, []);

  const toggle = useCallback(
    (item: Omit<TripItem, "id">) => {
      const id = makeTripItemId(item.type, item.name);
      setItems((prev) => {
        if (prev.some((i) => i.id === id)) {
          return prev.filter((i) => i.id !== id);
        }
        return [...prev, { ...item, id }];
      });
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const setDays = useCallback((next: number) => {
    setDaysState(Math.min(Math.max(Math.round(next), 1), 14));
  }, []);

  const value = useMemo<MyTripContextValue>(
    () => ({
      slug,
      city,
      items,
      days,
      hydrated,
      has,
      toggle,
      add,
      addMany,
      remove,
      clear,
      setDays,
      dailyBudget,
    }),
    [
      slug,
      city,
      items,
      days,
      hydrated,
      has,
      toggle,
      add,
      addMany,
      remove,
      clear,
      setDays,
      dailyBudget,
    ],
  );

  return <MyTripContext.Provider value={value}>{children}</MyTripContext.Provider>;
}

export function useMyTrip(): MyTripContextValue {
  const ctx = useContext(MyTripContext);
  if (!ctx) throw new Error("useMyTrip must be used within MyTripProvider");
  return ctx;
}
