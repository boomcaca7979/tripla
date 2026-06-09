"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

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
    pricing: "Pricing",
    login: "Log in",
    signup: "Sign up",
    logout: "Logout",
    comingSoon: "Coming soon",
  },

  // Footer
  footer: {
    rights: "All rights reserved.",
    home: "Home",
    pricing: "Pricing",
    poweredBy: "Powered by",
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

  // Pricing
  pricing: {
    title: "Pricing",
    subtitle: "Start free, upgrade anytime",
    free: "Free",
    pro: "Pro",
    forever: "/forever",
    month: "/month",
    freeDesc: "AI itinerary up to 3 days, basic flights, weather, currency",
    proDesc: "Unlimited AI days, PDF export, priority AI, multi-city trips",
    getStarted: "Get Started",
    recommended: "Recommended",
    comingSoon: "Coming Soon",
    feature: "Feature",
    // Feature names
    aiItinerary: "AI Itinerary",
    basicFlights: "Basic Flights",
    weather: "Weather",
    currency: "Currency",
    pdfExport: "PDF Export",
    priorityAI: "Priority AI",
    multiCityTrips: "Multi-City Trips",
    // Feature values
    upTo3Days: "Up to 3 days",
    unlimitedDays: "Unlimited days",
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
    pricing: "价格",
    login: "登录",
    signup: "注册",
    logout: "退出",
    comingSoon: "即将推出",
  },

  footer: {
    rights: "保留所有权利。",
    home: "首页",
    pricing: "价格",
    poweredBy: "技术支持",
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

  pricing: {
    title: "价格",
    subtitle: "免费开始，随时升级",
    free: "免费版",
    pro: "专业版",
    forever: "/永久",
    month: "/月",
    freeDesc: "AI 行程最多 3 天，基础航班、天气、汇率",
    proDesc: "无限 AI 天数，PDF 导出，优先 AI，多城市行程",
    getStarted: "开始使用",
    recommended: "推荐",
    comingSoon: "即将推出",
    feature: "功能",
    aiItinerary: "AI 行程",
    basicFlights: "基础航班",
    weather: "天气",
    currency: "汇率",
    pdfExport: "PDF 导出",
    priorityAI: "优先 AI",
    multiCityTrips: "多城市行程",
    upTo3Days: "最多 3 天",
    unlimitedDays: "无限天数",
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

// ── Provider ─────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "zh" || stored === "en") {
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

  const t = useCallback(
    (key: string) => get(DICTS[locale], key),
    [locale],
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
