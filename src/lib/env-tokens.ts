/**
 * env-tokens — 深色"环境世界"的墨色 token 族（首页 envDeep 之上唯一的文字/边界色族）。
 *
 * 为什么单独成模块：这套 token 有**两个消费方**，必须完全一致，否则会出现
 * "首帧一套色、hydration 后另一套色"的闪变：
 *   1. HomeEnvironment 在 hydration 后把它镜像到 :root，供包裹层之外
 *      （Header / Footer / body）使用；
 *   2. Header 在首页需要**首帧（SSR HTML）**就已经是正确的深色墨色 ——
 *      它渲染在 HomeEnvironment 包裹层之外，拿不到 :root 的运行时注入，
 *      因此直接把同一份 token 作为内联 style 渲染在 <header> 上。
 *
 * 取值口径：envDeep 恒为深色基底（亮度 L ≤ 0.125），因此这里一律使用浅墨族，
 * 保证任何天空/天气状态下文字都满足对比度要求。
 */

export const ENV_DARK_TOKENS: Record<string, string> = {
  "--ut-ink": "#f5f2ea",
  "--ut-text": "rgba(245, 242, 234, 0.92)",
  "--ut-text-2": "rgba(245, 242, 234, 0.78)",
  "--ut-muted": "rgba(245, 242, 234, 0.6)",
  "--ut-subtle": "rgba(245, 242, 234, 0.44)",
  "--ut-border": "rgba(245, 242, 234, 0.13)",
  "--ut-border-strong": "rgba(245, 242, 234, 0.24)",
  "--ut-surface": "rgba(245, 242, 234, 0.05)",
  "--ut-surface-hover": "rgba(245, 242, 234, 0.1)",
  "--ut-surface-elevated": "rgba(17, 19, 26, 0.55)",
};

/**
 * Header"实体化"外观（两处使用，仅**背景兜底色**不同）：
 *   · 首页：envDeep 由 JS 在 hydration 后注入 :root；首帧必须已经是对应的深色，
 *     因此用**深色兜底**（10,12,18），否则会出现"先浅后深"的闪变。
 *   · 非首页（纸面页）：从不注入 envDeep，保持既有的**浅色兜底**（250,249,246），
 *     即原实现的未滚动/滚动两态行为完全不变。
 */
const HEADER_SURFACE_COMMON = [
  "border-[rgba(var(--ut-accent-rgb,180,95,77),0.16)]",
  "shadow-ut-1",
  "backdrop-blur-md",
];

/** 首页专用：深色兜底（首帧即完整态）。 */
export const HEADER_FULL_STATE_CLASS = [
  ...HEADER_SURFACE_COMMON,
  "bg-[rgba(var(--ut-env-deep-rgb,10,12,18),0.82)]",
].join(" ");

/** 非首页：保持原实现的浅色兜底（行为不变）。 */
export const HEADER_SCROLLED_STATE_CLASS = [
  ...HEADER_SURFACE_COMMON,
  "bg-[rgba(var(--ut-env-deep-rgb,250,249,246),0.82)]",
].join(" ");
