/**
 * trips workspace — mock 种子数据。
 *
 * 口径（第二轮明确）：
 *  - **全部 demo 数据统一为一次 Tokyo trip** —— 不出现 Kyoto / 其他城市，
 *    让用户第一眼就确认"我现在正在管理一次 Tokyo trip"；
 *  - 数字对齐产品蓝图（Oct 18–24 · 4 travelers · 6 nights · 12 places ·
 *    3 hotels · 4 route days · spent ¥18,600 · committed ¥42,000 · planned ¥100,000 ·
 *    checklist 5 left）；
 *  - 日期用 ISO 字符串，确定性格式化，规避 SSR/CSR 时区漂移。
 */

import type { ActivityItem, InboxItem, Trip, WorkspaceState } from "./types";

export const TOKYO_TRIP_ID = "trip-tokyo";

const tokyo: Trip = {
  id: TOKYO_TRIP_ID,
  destination: "Tokyo",
  country: "Japan",
  status: "current",
  startDate: "2026-10-18",
  endDate: "2026-10-24",
  currency: "¥",
  budgetPlanned: 100000,
  flightBooked: true,
  travelers: [
    { id: "t-alex", name: "Alex" },
    { id: "t-sam", name: "Sam" },
    { id: "t-john", name: "John" },
    { id: "t-emma", name: "Emma" },
  ],
  places: [
    { id: "p-1", name: "Senso-ji", kind: "sight", area: "Asakusa", status: "must", note: "Go early, before the crowds" },
    { id: "p-2", name: "Shibuya Sky", kind: "sight", area: "Shibuya", status: "must", note: "Sunset slot — book ahead" },
    { id: "p-3", name: "Tsukiji Outer Market", kind: "food", area: "Tsukiji", status: "want" },
    { id: "p-4", name: "Fuji Day Trip", kind: "nature", area: "Kawaguchiko", status: "want", note: "Weather-dependent" },
    { id: "p-5", name: "teamLab Planets", kind: "activity", area: "Toyosu", status: "must" },
    { id: "p-6", name: "Meiji Shrine", kind: "sight", area: "Harajuku", status: "want" },
    { id: "p-7", name: "Golden Gai", kind: "food", area: "Shinjuku", status: "want" },
    { id: "p-8", name: "Ueno Park", kind: "nature", area: "Ueno", status: "want" },
    { id: "p-9", name: "Akihabara", kind: "shopping", area: "Akihabara", status: "want" },
    { id: "p-10", name: "Yanaka Ginza", kind: "food", area: "Yanaka", status: "want" },
    { id: "p-11", name: "Sumida River Walk", kind: "nature", area: "Sumida", status: "done" },
    { id: "p-12", name: "Robot Restaurant", kind: "activity", area: "Shinjuku", status: "skipped" },
  ],
  hotels: [
    {
      id: "h-1",
      name: "Hotel Gracery Shinjuku",
      pricePerNight: 21000,
      rating: 8.7,
      distanceKm: 1.2,
      breakfast: true,
      freeCancellation: true,
      preferred: true,
      booked: true,
      nights: 2,
    },
    {
      id: "h-2",
      name: "The Millennials Shibuya",
      pricePerNight: 17800,
      rating: 8.5,
      distanceKm: 3.4,
      breakfast: false,
      freeCancellation: true,
    },
    {
      id: "h-3",
      name: "UNPLAN Kagurazaka",
      pricePerNight: 13600,
      rating: 8.3,
      distanceKm: 4.1,
      breakfast: true,
      freeCancellation: false,
    },
  ],
  routeDays: [
    {
      id: "d-1",
      title: "Day 1 · Old Tokyo",
      distanceKm: 8.7,
      transitMin: 134,
      stops: [
        { id: "s-1", name: "Senso-ji", time: "09:00", area: "Asakusa" },
        { id: "s-2", name: "Nakamise Street", time: "11:00", area: "Asakusa" },
        { id: "s-3", name: "Lunch", time: "13:00", area: "Asakusa", note: "Tempura bowls" },
        { id: "s-4", name: "Tokyo Skytree", time: "15:00", area: "Sumida" },
        { id: "s-5", name: "Shibuya Crossing", time: "19:00", area: "Shibuya" },
      ],
    },
    {
      id: "d-2",
      title: "Day 2 · Modern Tokyo",
      distanceKm: 11.2,
      transitMin: 96,
      stops: [
        { id: "s-6", name: "Meiji Shrine", time: "09:30", area: "Harajuku" },
        { id: "s-7", name: "Omotesando", time: "11:30", area: "Shibuya" },
        { id: "s-8", name: "teamLab Planets", time: "14:00", area: "Toyosu" },
        { id: "s-9", name: "Shibuya Sky", time: "17:30", area: "Shibuya", note: "Sunset" },
        { id: "s-10", name: "Izakaya dinner", time: "20:00", area: "Shinjuku" },
      ],
    },
    {
      id: "d-3",
      title: "Day 3 · Fuji Day Trip",
      distanceKm: 121.0,
      transitMin: 278,
      stops: [
        { id: "s-11", name: "Train to Kawaguchiko", time: "08:00", note: "Chuo Line limited express" },
        { id: "s-12", name: "Chureito Pagoda", time: "10:30" },
        { id: "s-13", name: "Lake Kawaguchiko", time: "13:00", note: "Lakeside lunch" },
        { id: "s-14", name: "Onsen stop", time: "16:00" },
      ],
    },
    {
      // Day 4 为草稿（<2 stops）→ Overview 的 next steps 出现 "Plan Day 4"
      id: "d-4",
      title: "Day 4 · Odaiba",
      distanceKm: 0,
      transitMin: 0,
      stops: [{ id: "s-15", name: "Odaiba Seaside Park", time: "13:00", area: "Odaiba" }],
    },
  ],
  expenses: [
    {
      id: "e-1",
      title: "Sushi dinner",
      amount: 8600,
      category: "food",
      paidBy: "t-alex",
      splitBetween: ["t-alex", "t-sam", "t-john", "t-emma"],
    },
    {
      id: "e-2",
      title: "Metro cards",
      amount: 2400,
      category: "transport",
      paidBy: "t-sam",
      splitBetween: ["t-alex", "t-sam", "t-john", "t-emma"],
    },
    {
      id: "e-3",
      title: "teamLab tickets",
      amount: 5200,
      category: "tickets",
      paidBy: "t-alex",
      splitBetween: ["t-alex", "t-sam", "t-john", "t-emma"],
    },
    {
      id: "e-4",
      title: "Convenience store snacks",
      amount: 1200,
      category: "food",
      paidBy: "t-emma",
      splitBetween: ["t-alex", "t-sam", "t-john", "t-emma"],
    },
    {
      id: "e-5",
      title: "Taxi to hotel",
      amount: 1200,
      category: "transport",
      paidBy: "t-john",
      splitBetween: ["t-alex", "t-sam", "t-john", "t-emma"],
    },
  ],
  checklist: [
    { id: "c-1", label: "Hotel", phase: "before", done: true },
    { id: "c-2", label: "Flights", phase: "before", done: true },
    { id: "c-3", label: "Insurance", phase: "before", done: true },
    { id: "c-4", label: "teamLab reservation", phase: "before", done: false },
    { id: "c-5", label: "eSIM", phase: "before", done: false },
    { id: "c-6", label: "Airport transfer", phase: "before", done: false },
    { id: "c-7", label: "Suica top-up", phase: "during", done: false },
    { id: "c-8", label: "Photo book", phase: "after", done: false },
  ],
};

/** 全部为 Tokyo 相关收藏（第二轮：不出现其他城市） */
export const SEED_INBOX: InboxItem[] = [
  {
    id: "in-1",
    kind: "place",
    title: "Shibuya Sky",
    meta: "Shibuya · Tokyo",
    savedAt: "2026-09-20",
  },
  {
    id: "in-2",
    kind: "hotel",
    title: "Hotel Gracery",
    meta: "Shinjuku · Tokyo · ¥21,000 / night",
    savedAt: "2026-09-19",
  },
  {
    id: "in-3",
    kind: "activity",
    title: "Fuji Day Trip",
    meta: "Kawaguchiko · day trip from Tokyo",
    savedAt: "2026-09-18",
  },
  {
    id: "in-4",
    kind: "guide",
    title: "Tsukiji breakfast crawl",
    meta: "Guide · Tsukiji · Tokyo",
    savedAt: "2026-09-16",
  },
];

/** Recent activity 种子（写入即带可读时间标签，渲染零计算） */
export const SEED_ACTIVITY: ActivityItem[] = [
  { id: "a-1", text: "Added Shibuya Sky to Tokyo places", at: "Sep 20, 09:14" },
  { id: "a-2", text: "Added Hotel Gracery Shinjuku to Tokyo stay", at: "Sep 19, 20:41" },
  { id: "a-3", text: "Added expense Sushi dinner", at: "Sep 19, 13:02" },
  { id: "a-4", text: "Added stop Tokyo Skytree to Day 1", at: "Sep 18, 18:55" },
];

/**
 * 默认工作区：**完全为空**（第六轮产品规则）。
 * 没有任何预置 Trip / 地点 / 酒店 / 费用 / 旅客 / checklist / inbox ——
 * 一切内容必须来自用户自己的创建与保存。
 */
export function seedWorkspace(): WorkspaceState {
  return {
    trips: [],
    saved: [],
    inbox: [],
    activity: [],
    transactions: [],
    merchantRules: {},
  };
}

/**
 * Demo 数据（隔离）：仅当用户显式点击 "Load demo data" 时加载。
 * 与真实用户数据共用同一存储槽，但加载本身是用户主动行为。
 */
export function demoWorkspace(): WorkspaceState {
  return {
    trips: [tokyo],
    saved: [],
    inbox: SEED_INBOX,
    activity: SEED_ACTIVITY,
    transactions: [],
    merchantRules: {},
  };
}
