"use client";

/**
 * GuideSearch — /guides Hub 的即时搜索（纯本地匹配，零 API）。
 *
 * · 匹配范围：guide title / city / country / tags（normalize 后 includes）；
 * · 结果最多 8 条，点击进入 /guides/<slug>；Enter 选择第一条；Escape 清除；
 * · 视觉 = 马蜂窝 /mdd/ searchbox 1:1：#f2f2f2 细条、2px 圆角、#696969 文字，
 *   不做巨大 Hero 搜索（参考站该位置即为一条轻搜索条）。
 */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";

export interface GuideSearchDoc {
  slug: string;
  title: string;
  city: string;
  country: string;
  tags: string[];
}

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function GuideSearch({ docs }: { docs: readonly GuideSearchDoc[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return docs
      .filter((d) => {
        const hay = normalize(`${d.title} ${d.city} ${d.country} ${d.tags.join(" ")}`);
        return hay.includes(q);
      })
      .slice(0, 8);
  }, [docs, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuery("");
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div data-guide-search="" className="relative w-full">
      {/* mdd .searchbox .frm_query：#f2f2f2 底、2px 圆角、细条高度 */}
      <div className="flex h-[28px] items-center gap-2 rounded-[2px] bg-[#f2f2f2] px-3">
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 shrink-0 text-[#999]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4.5 4.5" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => { if (query) setOpen(true); }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
          placeholder="Search guides"
          aria-label="Search guides"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          className={`h-full w-full bg-transparent text-[13px] text-[#333] placeholder:text-[#999] focus:outline-none ${
            query ? "" : "text-center"
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            aria-label="Clear search"
            className="-mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] text-[#999] transition-colors hover:bg-[#e6e6e6] hover:text-[#333]"
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
          className="absolute inset-x-0 top-[calc(100%+6px)] z-30 max-h-[320px] overflow-y-auto rounded-[2px] border border-[#ddd] bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {results.map((r) => (
            <li key={r.slug} role="option" aria-selected={false}>
              <Link
                href={`/guides/${r.slug}`}
                className="flex items-baseline justify-between gap-3 rounded-[2px] px-3 py-2 transition-colors hover:bg-[#f2f2f2]"
                onClick={() => {
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span className="min-w-0 truncate text-[14px] leading-tight text-[#111]">
                  {r.title}
                </span>
                <span className="shrink-0 text-[12px] text-[#999]">
                  {r.city}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && results.length === 0 && (
        <p
          role="status"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-30 rounded-[2px] border border-[#ddd] bg-white px-4 py-3 text-[13px] text-[#696969]"
        >
          No guides match “{query}”
        </p>
      )}
    </div>
  );
}
