/**
 * budget-breakdown — /travel-budget/[slug] 的分项计算（从页面抽取，供全量测试）。
 *
 * 口径（与页面既有披露一致）：
 *   日预算总额 = destinations 数据的编辑估算值 budgetPerDay（口径见
 *   src/data/destinations.ts 头注释）。分项按通用旅行者比例拆分：
 *   住宿 40% / 餐饮 25% / 交通 15% / 活动 20%。
 *
 * 舍入规则：food / transportation / activities 独立四舍五入，舍入差额
 * 吸收进占比最大的 accommodation 分项（相对失真最小），保证
 *   accommodation + food + transportation + activities === budgetPerDay
 * 恒成立（页面同时显示总额与分项，和不相等是用户可见的数据不一致——
 * 曾在 Lisbon 110 出现 44+28+17+22=111 ≠ 110，2026-10-27 修复）。
 */

export const BREAKDOWN_RATIOS = {
  accommodation: 0.4,
  food: 0.25,
  transportation: 0.15,
  activities: 0.2,
} as const;

export function breakdownAmount(daily: number, ratio: number): number {
  return Math.round(daily * ratio);
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  transportation: number;
  activities: number;
}

export function budgetBreakdown(daily: number): BudgetBreakdown {
  const food = breakdownAmount(daily, BREAKDOWN_RATIOS.food);
  const transportation = breakdownAmount(daily, BREAKDOWN_RATIOS.transportation);
  const activities = breakdownAmount(daily, BREAKDOWN_RATIOS.activities);
  const accommodation = daily - food - transportation - activities;
  return { accommodation, food, transportation, activities };
}
