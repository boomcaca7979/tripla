"use client";

/**
 * workspace/inline — Notion-like inline editing 原语。
 *
 * 范式（本轮 Workspace-driven 重构的核心）：
 *   See → Click → Edit（而不是 Open form → Fill → Submit）。
 *
 * 所有原语共享同一套键盘契约（spec #31）：
 *   Enter  = 保存；Escape = 取消；Tab = 浏览器自然移动到下一字段。
 * 保存一律通过调用方 dispatch 走现有 reducer / localStorage —— 不建第二套 state。
 */

import { useState, type ReactNode } from "react";

/** cell 内输入框的统一样式（无边框，focus 时浮现边） */
const CELL_INPUT =
  "w-full rounded-md border border-ut-accent/60 bg-white px-1.5 py-0.5 text-[0.8125rem] text-ut-text focus:outline-none";
const CELL_TEXT = "cursor-text rounded-md px-1.5 py-0.5 -mx-1.5 hover:bg-[#f0f4f2] transition-colors";

/** 单元格通用容器：非编辑态显示为可点击文本 */
function Cell({
  editing,
  onEdit,
  children,
  align = "left",
  title,
}: {
  editing: boolean;
  onEdit: () => void;
  children: ReactNode;
  align?: "left" | "right";
  title?: string;
}) {
  if (editing) return <>{children}</>;
  return (
    <span
      role="button"
      tabIndex={0}
      title={title}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEdit();
        }
      }}
      className={`${CELL_TEXT} block text-left ${align === "right" ? "text-right" : ""}`}
    >
      {children}
    </span>
  );
}

/** 点击文字 → input，Enter/blur 保存，Escape 取消 */
export function InlineText({
  value,
  onCommit,
  placeholder = "—",
  className = "text-[0.8125rem] text-ut-text",
  inputClassName,
  muted,
}: {
  value: string;
  onCommit: (next: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  muted?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== value.trim()) onCommit(next);
  };

  if (!editing) {
    return (
      <Cell editing={false} onEdit={() => { setDraft(value); setEditing(true); }}>
        <span className={`${muted ? "text-[#9aa5a8]" : ""} ${className}`}>{value || placeholder}</span>
      </Cell>
    );
  }
  return (
    <input
      autoFocus
      className={inputClassName ?? CELL_INPUT}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      aria-label="Edit value"
    />
  );
}

/** 数字 cell（金额/价格/晚数） */
export function InlineNumber({
  value,
  onCommit,
  display,
  align = "right",
  placeholder = "—",
}: {
  value: number;
  onCommit: (next: number) => void;
  /** 展示文案（如 "฿240"）；默认 String(value) */
  display?: string;
  align?: "left" | "right";
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    setEditing(false);
    const n = Number(draft.replace(/[,\s]/g, ""));
    if (Number.isFinite(n) && n !== value) onCommit(n);
  };

  if (!editing) {
    return (
      <Cell editing={false} onEdit={() => { setDraft(String(value)); setEditing(true); }} align={align}>
        <span className="text-[0.8125rem] tabular-nums text-ut-text">{display ?? value}</span>
      </Cell>
    );
  }
  return (
    <input
      autoFocus
      inputMode="decimal"
      className={`${CELL_INPUT} ${align === "right" ? "text-right tabular-nums" : ""}`}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setDraft(String(value));
          setEditing(false);
        }
      }}
      aria-label="Edit number"
    />
  );
}

/** 日期 cell（ISO yyyy-mm-dd；空值显示 —） */
export function InlineDate({
  value,
  onCommit,
  display,
}: {
  value: string;
  onCommit: (next: string) => void;
  display?: string;
}) {
  const [editing, setEditing] = useState(false);
  if (!editing) {
    return (
      <Cell editing={false} onEdit={() => setEditing(true)}>
        <span className="text-[0.8125rem] tabular-nums text-ut-text-2">{display || value || "—"}</span>
      </Cell>
    );
  }
  return (
    <input
      autoFocus
      type="date"
      className={`${CELL_INPUT} tabular-nums`}
      value={value}
      onChange={(e) => {
        onCommit(e.target.value);
        if (e.target.value) setEditing(false);
      }}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
      aria-label="Edit date"
    />
  );
}

/** select cell：平时显示为普通文本，点击出现下拉 */
export function InlineSelect<T extends string>({
  value,
  options,
  onCommit,
  render,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onCommit: (next: T) => void;
  /** 展示节点；默认 options 里对应 label */
  render?: (v: T) => ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const current = options.find((o) => o.value === value);
  if (!editing) {
    return (
      <Cell editing={false} onEdit={() => setEditing(true)}>
        {render ? render(value) : (
          <span className="text-[0.8125rem] text-ut-text-2">{current?.label ?? value}</span>
        )}
      </Cell>
    );
  }
  return (
    <select
      autoFocus
      className={`${CELL_INPUT} cursor-pointer`}
      value={value}
      onChange={(e) => {
        onCommit(e.target.value as T);
        setEditing(false);
      }}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
      aria-label="Edit selection"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/**
 * 新增行（+ Add row 的行内形态）：一行 inputs，Enter 保存、Escape 取消。
 * 不打开 Modal —— spec #3。
 */
export function NewRow({
  cells,
  onSave,
  onCancel,
}: {
  /** 每个字段一个渲染函数，拿到 (ref-focus, keydown handler) */
  cells: Array<{ render: (kbd: (e: React.KeyboardEvent) => void) => ReactNode }>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const kbd = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };
  return (
    <>
      {cells.map((c, i) => (
        <div key={i}>{c.render(kbd)}</div>
      ))}
      <div className="flex items-center justify-end gap-1.5">
        <button type="button" onClick={onSave} className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ut-accent hover:text-ut-accent-strong">
          Save
        </button>
        <button type="button" onClick={onCancel} className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#8a969a] hover:text-ut-ink">
          Cancel
        </button>
      </div>
    </>
  );
}

/** 行 hover 动作组（spec #30：Edit / ⋯ / Delete 只在 hover 出现） */
export function HoverActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
      {children}
    </div>
  );
}

/** hover 删除小按钮（带确认） */
export function HoverDelete({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  return (
    <button
      type="button"
      aria-label={`Delete ${label}`}
      onClick={() => {
        if (window.confirm(`Delete ${label}?`)) onConfirm();
      }}
      className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#8a969a] transition-colors hover:text-[#c4453d]"
    >
      Delete
    </button>
  );
}

/** 行内 add 按钮的统一样式（Notion 的浅灰 "+ New"） */
export const ADD_ROW_BTN =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[0.75rem] font-semibold text-ut-text-2 transition-colors hover:bg-[#f0f4f2] hover:text-ut-ink";

/**
 * CaptureLine — 永久存在的「Write something...」捕获行（spec：彻底取消新增表单）。
 *
 * 不是按钮、不是表单、不是 input group：就是一行可直接输入的内容。
 * Enter → onSubmit(整句原文) 并清空行（可连续输入）；Escape → 清空并失焦。
 * 解析（金额/币种/时间）由各工作区按自己的语义处理。
 */
export function CaptureLine({
  placeholder = "Write something...",
  onSubmit,
  focusRef,
  autoFocus = false,
}: {
  placeholder?: string;
  onSubmit: (text: string) => void;
  /** 外部需要程序化聚焦（如 Trip 「+ Add」nonce）时传入 */
  focusRef?: React.RefObject<HTMLInputElement | null>;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  return (
    <input
      ref={focusRef}
      autoFocus={autoFocus}
      className="w-full cursor-text bg-transparent px-4 py-3 text-[0.875rem] text-ut-text placeholder:text-[#9aa5a8] focus:outline-none"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
          e.preventDefault();
          const text = value.trim();
          if (!text) return;
          onSubmit(text);
          setValue("");
        } else if (e.key === "Escape") {
          setValue("");
          (e.target as HTMLInputElement).blur();
        }
      }}
      aria-label="Quick capture"
    />
  );
}
