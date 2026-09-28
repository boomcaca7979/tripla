"use client";

import { createContext, useContext, useCallback, type ReactNode } from "react";

// ── Types ────────────────────────────────────────────────────────────

export type Locale = "en";

type TranslationValue = string | { [key: string]: TranslationValue };
type TranslationDict = { [key: string]: TranslationValue };

// ── Translation dictionaries ─────────────────────────────────────────

const en: TranslationDict = {
  // Header
  nav: {
    home: "Home",
    destinations: "Destinations",
    // /guides 是目的地目录（该页 title 亦为 "Destinations"）；/destinations 是夜球地图。
    // 两个标签各自与目标页自身语义一致 —— 消除"Guides 指向目的地目录"的命名冲突。
    atlas: "Atlas",
    // /trips 是用户的个人旅行工作台（Trips/Saved/Inbox/Expenses/Profile/Settings），
    // 导航语义为"个人中心"；URL 保持 /trips 不变（不做 route 迁移）。
    account: "Account",
    // 认证入口（未登录时的 Header / 抽屉；已登录时的账号菜单）
    signIn: "Sign in",
    createAccount: "Create account",
    signOut: "Sign out",
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
    contact: "Contact",
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

/**
 * uTripla 是 English international travel site。历史上曾有不完整的 en/zh
 * 双语开关（只覆盖导航/footer，正文仍是英文）—— 已连同 zh 词条与切换入口
 * 一起移除（假双语不留）。本模块保留 `t()` 的既有调用面（多处组件在用），
 * 解析恒为英文词典；`setLocale` 保留为兼容空操作，不再有任何 UI 入口。
 */
interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
  const t = useCallback((key: string) => get(en, key), []);

  return (
    <I18nContext.Provider value={{ locale: "en", setLocale: () => {}, t }}>
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
