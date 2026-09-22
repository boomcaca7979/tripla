"use client";

/**
 * workspace/ui — Personal Travel Workspace 的共享视觉原语。
 *
 * 视觉原则（第六轮，参考 Stippl 后台，用户提供截图）：
 *  - 浅色系：浅灰绿 shell + 白卡 + 极淡边框 + 柔和阴影；
 *  - emerald 强调：主按钮绿底白字胶囊、链接绿字；active = mint 胶囊；
 *  - 全 sans 层级（Notion-like，spec #32）：Page title 22-24px semibold（不再 32-40px 巨标题，
 *    数字永不大于标题）/ Section 14-16px semibold / Content 14-15px / Meta 12-13px / Label 10-11px；
 *  - 空态语言：空数据库本身就是 UI，只允许一行很小的辅助文字（禁营销大卡）。
 */

import type { ReactNode } from "react";

/* ── Surface ─────────────────────────────────────────────────────── */

/** 白卡（Stippl 的 Continue planning / empty state 卡） */
export const PANEL =
  "rounded-2xl border border-[#e8ecec] bg-white shadow-[0_1px_2px_rgba(23,36,42,0.04)]";

/** 内容对象卡片（地点/酒店/账目） */
export const CARD =
  "rounded-2xl border border-[#e8ecec] bg-white transition-colors hover:border-[#d7dedd]";

/** 次级小条目（嵌套浅灰面板） */
export const PANEL_SOFT =
  "rounded-xl border border-[#eef1f0] bg-[#f6f8f7]";

/* ── Typography 常量 ─────────────────────────────────────────────── */

/**
 * 六层字体系统（蓝图 #2）：
 *   T_PAGE   Page title    24px bold     —— My trips / Saved / Inbox / Expenses
 *   T_TRIP   Trip title    20px bold     —— Trip workspace 当前对象标题
 *   T_SECTION Section title 14px semibold —— Current / Next actions / Your trip
 *   T_CARD   Card title    15px semibold —— Places / Stay 等内容卡标题、对象名
 *   T_META   Metadata      13px regular secondary —— 日期 · 人数 · 说明
 *   MONO_META Label        11px uppercase —— CURRENT / WANT / BOOKED 状态标签
 * 数字：NUM 降为 1.125rem semibold tabular（不再是 KPI 大数字）。
 */
export const T_PAGE =
  "text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.015em] text-ut-ink";
export const T_TRIP =
  "text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.01em] text-ut-ink";
export const T_SECTION =
  "text-[0.875rem] font-semibold tracking-[-0.005em] text-ut-ink";
export const T_CARD =
  "text-[0.9375rem] font-semibold tracking-[-0.005em] text-ut-ink";
export const T_META = "text-[0.8125rem] leading-[1.45] text-ut-muted";

/** 小节标签（Stippl 的 TOP 10 / POPULAR COUNTRIES 式绿色小标签） */
export const MONO_META =
  "text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ut-muted";

/** 元信息行（日期 · 人数等） */
export const META_LINE = "text-[0.8125rem] text-ut-text-2";

/** 大数字（semibold 深色） */
export const NUM =
  "font-sans text-[1.125rem] font-semibold leading-none tracking-[-0.01em] text-ut-ink tabular-nums";

/* ── Buttons（Stippl 胶囊语言） ──────────────────────────────────── */

/** 次级按钮（白底描边胶囊） */
export const BTN_GHOST =
  "inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#dfe5e4] bg-white px-5 text-[0.8125rem] font-semibold text-ut-text transition-colors hover:border-[#c6d0ce] hover:bg-[#f6f8f7] focus-visible:outline-2 focus-visible:outline-ut-accent disabled:cursor-not-allowed disabled:opacity-40";

/** 主按钮（emerald 实底胶囊 + 白字） */
export const BTN_PRIMARY =
  "inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-full bg-ut-accent px-5 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-ut-accent-strong focus-visible:outline-2 focus-visible:outline-ut-accent disabled:cursor-not-allowed disabled:opacity-40";

/** 小号胶囊按钮（行内动作） */
export const BTN_SMALL =
  "inline-flex h-8 cursor-pointer items-center justify-center gap-1 rounded-full border border-[#dfe5e4] bg-white px-3 text-[0.75rem] font-semibold text-ut-text transition-colors hover:border-[#c6d0ce] hover:bg-[#f6f8f7] disabled:cursor-not-allowed disabled:opacity-40";

/** 工具栏文字操作（Import / + Add receipt 级别：必须比内容弱） */
export const TOOLBAR_ACTION =
  "cursor-pointer text-[0.75rem] font-medium text-ut-text-2 transition-colors hover:text-ut-ink";

/** 文字链接按钮（"See all →" 式绿字） */
export const BTN_LINK =
  "cursor-pointer text-[0.8125rem] font-semibold text-ut-accent transition-colors hover:text-ut-accent-strong";

/** 危险/次要小动作（Remove 等，红字 hover） */
export const BTN_ICON_TEXT =
  "cursor-pointer text-[0.75rem] font-semibold text-[#8a969a] transition-colors hover:text-[#c4453d]";

/** 输入框（白底细边） */
export const INPUT =
  "h-10 w-full rounded-xl border border-[#dfe5e4] bg-white px-3 text-body-sm text-ut-text placeholder:text-[#9aa5a8] transition-colors focus:border-ut-accent focus:outline-none";

/* ── 模块头 ──────────────────────────────────────────────────────── */

/**
 * 模块头：小节标签 + 数量 + 右侧操作按钮。
 */
export function ModuleHead({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex items-baseline gap-3">
        <h3 className="text-[0.9375rem] font-semibold tracking-[-0.005em] text-ut-ink">{title}</h3>
        {meta && <span className={META_LINE}>{meta}</span>}
      </div>
      {action}
    </div>
  );
}

/** 状态 pill（select 包装） */
export const STATUS_SELECT =
  "h-8 cursor-pointer rounded-full border border-[#dfe5e4] bg-white px-3 text-[0.75rem] font-semibold text-ut-text-2 transition-colors hover:border-[#c6d0ce] focus:outline-none";

/** 分隔细线 */
export function Rule({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`h-px w-full bg-[#eef1f0] ${className}`} />;
}

/** 空态（Stippl empty state：mint 圆形图标 + 标题 + 描述 + CTA） */
export function EmptyState({
  title,
  description,
  action,
}: {
  /** 兼容旧调用点；Notion-like 空态不再展示大图标 */
  icon?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-[0.875rem] font-semibold text-ut-text-2">{title}</p>
      <p className="mt-1 max-w-sm text-[0.8125rem] leading-relaxed text-ut-muted">{description}</p>
      {action && <div className="mt-4 flex flex-wrap items-center justify-center gap-3">{action}</div>}
    </div>
  );
}

/** 面板容器（PANEL 类名的组件包装） */
export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${PANEL} ${className ?? ""}`}>{children}</div>;
}

/** Modal（Stippl 式居中弹层：New trip / Edit trip 等，不跳页面） */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#17242a]/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#e8ecec] bg-white p-6 shadow-[0_12px_40px_rgba(23,36,42,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[1.0625rem] font-bold tracking-[-0.01em] text-ut-ink">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#dfe5e4] bg-white text-[0.8rem] text-[#8a969a] transition-colors hover:text-ut-ink"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}


/**
 * ViewSelect — 轻量视图切换（spec #6：`Table ▾` 下拉，不是一排大 Tabs）。
 * Review 可带 badge（spec #7）。
 */
export function ViewSelect<T extends string>({
  value,
  options,
  onChange,
  label = "View",
}: {
  value: T;
  options: Array<{ key: T; label: string; badge?: number }>;
  onChange: (v: T) => void;
  label?: string;
}) {
  const current = options.find((o) => o.key === value) ?? options[0];
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={label}
        className="h-8 cursor-pointer appearance-none rounded-lg border border-[#e3e8e7] bg-white pl-3 pr-8 text-[0.8125rem] font-semibold text-ut-ink transition-colors hover:border-[#c6d0ce] focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
            {o.badge ? ` (${o.badge})` : ""}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="pointer-events-none absolute right-2.5 text-[0.625rem] text-ut-muted">
        ▾
      </span>
      {current?.badge ? (
        <span className="pointer-events-none absolute -right-2 -top-1.5 rounded-full bg-[#8a5a12] px-1.5 py-0.5 text-[0.5625rem] font-bold leading-none text-white">
          {current.badge}
        </span>
      ) : null}
    </div>
  );
}
