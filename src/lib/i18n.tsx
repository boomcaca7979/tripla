"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────

export type Locale = "en" | "zh";

type TranslationValue = string | { [key: string]: TranslationValue };
type TranslationDict = { [key: string]: TranslationValue };

// ── Translation dictionaries ─────────────────────────────────────────

const en: TranslationDict = {
  // Header
  nav: {
    home: "Home",
    destinations: "Destinations",
    guides: "Guides",
    trips: "Trips",
    routes: "Trips",
    regions: "Regions",
    bestTime: "Best Time to Visit",
    comingSoon: "Coming soon",
  },

  // Footer
  footer: {
    rights: "All rights reserved.",
    home: "Home",
    poweredBy: "Powered by",
    tagline: "Discover where to disappear to.",
    discover: "Discover",
    travel: "Travel",
    tools: "Tools",
    about: "About",
    travelStyles: "Travel Styles",
    budget: "Travel Budget",
    plan: "Plan a Trip",
    share: "Share",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    affiliates:
      "Some links on this site are affiliate links — if you book through them, we may earn a commission at no extra cost to you.",
  },

  // Hero
  hero: {
    title1: "Plan smarter.",
    title2: "Travel better.",
    tagline: "Don't think. Just tripla.",
    description:
      "AI-powered trip planning that combines real-time flight data, intelligent weather scoring, and personalised itineraries — all in one place.",
  },

  // SearchBar
  search: {
    from: "From",
    to: "To",
    fromPlaceholder: "City or airport…",
    toPlaceholder: "City or airport…",
    travelers: "Travelers",
    travelStyle: "Travel Style",
    budget: "Budget",
    interests: "Interests",
    planMyTrip: "Plan My Trip",
    errorOriginDest: "Please select both origin and destination airports.",
    errorDates: "Please select both departure and return dates.",
    // Travel styles
    relaxed: "Relaxed",
    active: "Active",
    cultural: "Cultural",
    foodie: "Foodie",
    adventure: "Adventure",
    // Budget levels
    budgetLevel: "Budget",
    midRange: "Mid-Range",
    luxury: "Luxury",
    // Interests
    museums: "Museums & Galleries",
    nature: "Nature & Outdoors",
    food: "Food & Drink",
    shopping: "Shopping",
    nightlife: "Nightlife",
    history: "History & Landmarks",
    sports: "Sports",
    beaches: "Beaches & Coast",
  },

  // AI Showcase
  aiShowcase: {
    title: "AI-Powered Travel Planning",
    subtitle: "Three core capabilities that make trip planning effortless",
    smartItinerary: "AI Smart Itinerary",
    smartItineraryDesc:
      "AI generates daily schedules based on your preferences and real-time weather.",
    realTimeData: "Real-time Data",
    realTimeDataDesc:
      "Live flight prices, weather forecasts, and currency rates at your fingertips.",
    flexiblePlanning: "Flexible Planning",
    flexiblePlanningDesc:
      "Change your mind? Adjust dates, budget, or style and re-plan instantly.",
    startPlanning: "Start Planning Now",
  },

  // Itinerary Preview
  itineraryPreview: {
    title: "Popular Destinations",
    subtitle: "Preview real itineraries — see what tripla can create for you",
    days: "days",
    est: "est.",
    day: "Day",
    planWithTemplate: "Plan with this template",
    templateHint:
      "Auto-fills destination and preferences — just pick your dates",
    templateApplied:
      "Template applied! Select your dates and click Plan My Trip",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
  },

  // Language
  lang: {
    en: "English",
    zh: "中文",
  },
};

const zh: TranslationDict = {
  nav: {
    home: "首页",
    destinations: "目的地",
    guides: "攻略",
    trips: "行程",
    routes: "行程",
    regions: "地区",
    bestTime: "最佳旅行时间",
    comingSoon: "即将推出",
  },

  footer: {
    rights: "保留所有权利。",
    home: "首页",
    poweredBy: "技术支持",
    tagline: "发现下一个想消失的地方。",
    discover: "发现",
    travel: "旅行",
    tools: "工具",
    about: "关于",
    travelStyles: "旅行风格",
    budget: "旅行预算",
    plan: "规划旅程",
    share: "分享",
    privacy: "隐私政策",
    terms: "服务条款",
    affiliates:
      "本站部分链接为联盟推广链接——通过它们预订，我们可能获得佣金，费用不会因此增加。",
  },

  hero: {
    title1: "聪明规划。",
    title2: "更好旅行。",
    tagline: "别想太多，交给 tripla。",
    description:
      "AI 驱动的旅行规划，整合实时航班数据、智能天气评分和个性化行程——一站式搞定。",
  },

  search: {
    from: "出发地",
    to: "目的地",
    fromPlaceholder: "城市或机场…",
    toPlaceholder: "城市或机场…",
    travelers: "出行人数",
    travelStyle: "旅行风格",
    budget: "预算",
    interests: "兴趣",
    planMyTrip: "规划我的旅行",
    errorOriginDest: "请选择出发地和目的地机场。",
    errorDates: "请选择出发和返回日期。",
    relaxed: "休闲",
    active: "活力",
    cultural: "文化",
    foodie: "美食",
    adventure: "探险",
    budgetLevel: "经济",
    midRange: "中档",
    luxury: "豪华",
    museums: "博物馆与画廊",
    nature: "自然与户外",
    food: "美食与饮品",
    shopping: "购物",
    nightlife: "夜生活",
    history: "历史与地标",
    sports: "运动",
    beaches: "海滩与海岸",
  },

  aiShowcase: {
    title: "AI 驱动的旅行规划",
    subtitle: "三大核心能力，让行程规划毫不费力",
    smartItinerary: "AI 智能行程",
    smartItineraryDesc:
      "AI 根据你的偏好和实时天气生成每日行程安排。",
    realTimeData: "实时数据",
    realTimeDataDesc: "实时航班价格、天气预报和汇率，尽在指尖。",
    flexiblePlanning: "灵活规划",
    flexiblePlanningDesc:
      "改变主意了？调整日期、预算或风格，即刻重新规划。",
    startPlanning: "立即开始规划",
  },

  itineraryPreview: {
    title: "热门目的地",
    subtitle: "预览真实行程——看看 tripla 能为你创建什么",
    days: "天",
    est: "预估",
    day: "第",
    planWithTemplate: "使用此模板规划",
    templateHint: "自动填入目的地和偏好——只需选择日期",
    templateApplied: "模板已应用！选择日期后点击规划我的旅行",
    morning: "上午",
    afternoon: "下午",
    evening: "晚上",
  },

  lang: {
    en: "English",
    zh: "中文",
  },
};

const DICTS: Record<Locale, TranslationDict> = { en, zh };

// ── Helper: nested key access ────────────────────────────────────────

function get(dict: TranslationDict, path: string): string {
  const keys = path.split(".");
  let current: TranslationValue = dict;
  for (const key of keys) {
    if (typeof current === "object" && current !== null && key in current) {
      current = current[key];
    } else {
      return path; // fallback to key
    }
  }
  return typeof current === "string" ? current : path;
}

// ── Context ──────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "tripla-lang";

/**
 * 首页（"/"）强制英文：首页面向国际用户，UI 语言不跟随已保存的 locale，
 * 因此不会在首页出现中文界面文案。其余路由行为完全不变（仍按 locale 渲染）。
 * 只影响 t() 的解析语言，不改写用户保存的偏好。
 */
const ENGLISH_ONLY_ROUTES = new Set(["/"]);

// ── Provider ─────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Locale>("en");

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "zh" || stored === "en") {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 从 localStorage 恢复语言（SSR 安全模式，官方推荐）
        setLocaleState(stored);
      }
    } catch {
      // SSR or storage unavailable
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // storage unavailable
    }
    setLocaleState(l);
  }, []);

  // 解析语言：首页恒为英文，其余路由 = 用户 locale。
  const resolvedLocale: Locale =
    ENGLISH_ONLY_ROUTES.has(pathname ?? "/") ? "en" : locale;

  const t = useCallback(
    (key: string) => get(DICTS[resolvedLocale], key),
    [resolvedLocale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return ctx;
}
