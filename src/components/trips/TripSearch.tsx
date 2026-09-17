"use client";

/**
 * TripSearch — /trips Hub 的即时搜索（纯本地匹配，零 API）。
 *
 * 匹配范围：trip title / city / country / travelStyle / interests / tags。
 * 结果最多 8 条，点击进入 /trips/<slug>；Escape 清除。
 * 只接收轻量 stub（不含 itinerary），不把完整 TRIPS 塞进客户端。
 */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";

export interface TripSearchDoc {
  slug: string;
  title: string;
  city: string;
  country: string;
  days: number;
  travelStyle: string;
  interests: string[];
  tags: string[];
}

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function TripSearch({ docs }: { docs: readonly TripSearchDoc[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return docs
      .filter((d) => {
        const hay = normalize(
          `${d.title} ${d.city} ${d.country} ${d.travelStyle} ${d.interests.join(" ")} ${d.tags.join(" ")}`,
        );
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
    <div data-trip-search="" className="relative mx-auto w-full max-w-xl">
      <div className="flex items-center gap-2 rounded-ut-sm border border-white/15 bg-[#0b0f18]/80 px-3 backdrop-blur-md">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-white/45"
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
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (query) setOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
          placeholder="Search trips by city, style or interest…"
          aria-label="Search trips"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          className="h-10 w-full bg-transparent text-[0.9rem] text-white/90 placeholder:text-white/40 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            aria-label="Clear search"
            className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-ut-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-30 max-h-[320px] overflow-y-auto rounded-ut-md border border-white/10 bg-[#0b0f18]/95 p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-md"
        >
          {results.map((r) => (
            <li key={r.slug} role="option" aria-selected={false}>
              <Link
                href={`/trips/${r.slug}`}
                className="flex items-baseline justify-between gap-3 rounded-ut-sm px-3 py-2 transition-colors hover:bg-white/8"
                onClick={() => {
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span className="min-w-0 truncate font-display text-[0.9rem] leading-tight text-white/90">
                  {r.title}
                </span>
                <span className="shrink-0 font-mono text-micro uppercase tracking-[0.12em] text-white/40">
                  {r.city} · {r.days}d
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && results.length === 0 && (
        <p
          role="status"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-30 rounded-ut-md border border-white/10 bg-[#0b0f18]/95 px-4 py-3 font-mono text-micro uppercase tracking-[0.14em] text-white/50 backdrop-blur-md"
        >
          No trips match “{query}”
        </p>
      )}
    </div>
  );
}
