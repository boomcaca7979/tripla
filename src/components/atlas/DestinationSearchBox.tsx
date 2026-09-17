"use client";

/**
 * DestinationSearchBox — 站内目的地搜索（地球页面通用控件）。
 *
 * · 搜索索引**完全派生自调用方传入的 destination docs**（源头是 src/data/destinations.ts），
 *   不接任何 geocoding / places API、零网络请求；
 * · 选择 → onSelect（调用方负责相机定位 / 选中态）；清除 → onClear（调用方决定是否清选中态，
 *   相机不应被强制归位）；
 * · tone：dark = 深色空间上的白字 chrome（/destinations 生产页），light = 浅色空间上的墨字
 *   chrome（map-test 浅色实验态）。结果下拉恒为深色浮层卡（两种背景下对比都最好）。
 * · 键盘：Enter 选择（多结果时用当前高亮项）、↑↓ 移动高亮、Escape 清除。
 */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { searchDestinations, type DestinationSearchDoc } from "@/lib/atlas/destination-search";

interface DestinationSearchBoxProps {
  docs: readonly DestinationSearchDoc[];
  onSelect(doc: DestinationSearchDoc): void;
  onClear?(): void;
  tone?: "dark" | "light";
  placeholder?: string;
}

/** 输入行 chrome（结果下拉恒为深色浮层卡，不随 tone 变化）。 */
const TONE_CLASSES = {
  dark: {
    row: "border-white/12 bg-[#070c16]/70",
    icon: "text-white/40",
    input: "text-white/85 placeholder:text-white/35",
    clear: "text-white/45 hover:bg-white/10",
  },
  light: {
    row: "border-[#23272f]/15 bg-[#faf9f6]/85",
    icon: "text-[#23272f]/45",
    input: "text-[#23272f] placeholder:text-[#23272f]/40",
    clear: "text-[#23272f]/50 hover:bg-[#23272f]/10",
  },
} as const;

export default function DestinationSearchBox({
  docs,
  onSelect,
  onClear,
  tone = "dark",
  placeholder = "Search destinations…",
}: DestinationSearchBoxProps) {
  const toneCls = TONE_CLASSES[tone];
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const listId = useId();

  const results = useMemo(
    () => (query.trim() ? searchDestinations(docs, query, 8) : []),
    [docs, query],
  );
  // 键盘处理读 ref：快速输入时 React 尚未 flush 新结果，避免用过期闭包
  const resultsRef = useRef(results);
  useEffect(() => { resultsRef.current = results; }, [results]);

  const clear = () => {
    setQuery("");
    setOpen(false);
    setActiveIdx(0);
    onClear?.();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = resultsRef.current;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (list.length) setActiveIdx((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = activeIdx < list.length ? activeIdx : 0;
      const pick = list[idx] ?? list[0];
      if (pick) {
        onSelect(pick);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      clear();
    }
  };

  return (
    <div
      data-globe-search=""
      className="relative w-[230px] md:w-[260px]"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <div
        className={`flex items-center gap-2 rounded-ut-sm border px-2.5 backdrop-blur-md ${toneCls.row}`}
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 shrink-0 ${toneCls.icon}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4.5 4.5" />
        </svg>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIdx(0);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => { if (query) setOpen(true); }}
          placeholder={placeholder}
          aria-label="Search destinations"
          aria-expanded={open && results.length > 0}
          role="combobox"
          aria-controls={listId}
          className={`h-8 w-full bg-transparent font-mono text-micro tracking-[0.08em] focus:outline-none ${toneCls.input}`}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className={`-mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-ut-sm transition-colors ${toneCls.clear}`}
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+6px)] max-h-[268px] overflow-y-auto rounded-ut-md border border-white/10 bg-[#080d18]/92 p-1 backdrop-blur-md"
        >
          {results.map((r, i) => (
            <li key={r.slug} role="option" aria-selected={i === activeIdx}>
              <button
                type="button"
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => {
                  onSelect(r);
                  setOpen(false);
                }}
                className={`flex w-full items-baseline justify-between gap-2 rounded-ut-sm px-2 py-1.5 text-left transition-colors ${
                  i === activeIdx ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <span className="font-display text-[0.82rem] leading-tight text-white/90">
                  {r.city}
                </span>
                <span className="shrink-0 font-mono text-micro uppercase tracking-[0.12em] text-white/40">
                  {r.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && results.length === 0 && (
        <p
          role="status"
          className="absolute inset-x-0 top-[calc(100%+6px)] rounded-ut-md border border-white/10 bg-[#080d18]/92 px-3 py-2 font-mono text-micro uppercase tracking-[0.14em] text-white/45 backdrop-blur-md"
        >
          No destinations match “{query}”
        </p>
      )}
    </div>
  );
}
