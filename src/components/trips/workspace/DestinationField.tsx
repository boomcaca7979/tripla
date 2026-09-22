"use client";

/**
 * DestinationField —— 从真实 UTRIPLA DESTINATIONS 数据中选择（蓝图 #6/#7）。
 * 不允许自由文本：Trip 必须正式关联 destinationId/slug。
 * 输入过滤 city/country → 下拉建议（小识别图 + city + country）→ 选中锁定。
 */

import { useMemo, useState } from "react";
import { DESTINATIONS } from "@/data/destinations";
import { INPUT, MONO_META } from "./ui";

export interface DestinationChoice {
  id: string;
  slug: string;
  name: string;
  country: string;
  image: string | null;
}

export function toChoice(slug: string): DestinationChoice | null {
  const d = DESTINATIONS.find((x) => x.slug === slug);
  if (!d) return null;
  return { id: d.id, slug: d.slug, name: d.city, country: d.country, image: d.image };
}

export default function DestinationField({
  value,
  onChange,
}: {
  value: DestinationChoice | null;
  onChange: (v: DestinationChoice | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DESTINATIONS.slice(0, 6);
    return DESTINATIONS.filter(
      (d) => d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q),
    ).slice(0, 6);
  }, [query]);

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-ut-sm border border-[#e8ecec] bg-[#f6f8f7] p-2.5">
        {value.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.image}
            alt=""
            className="shrink-0 rounded-md object-cover"
            style={{ width: 40, height: 28 }}
          />
        ) : (
          <span
            aria-hidden="true"
            className="shrink-0 rounded-md"
            style={{ width: 40, height: 28, background: "linear-gradient(135deg,#0aa56c88,#17242ae0)" }}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[0.875rem] font-semibold text-ut-ink">{value.name}</p>
          <p className={MONO_META}>{value.country}</p>
        </div>
        <button
          type="button"
          className="cursor-pointer text-[0.75rem] font-semibold text-ut-accent transition-colors hover:text-ut-accent-strong"
          onClick={() => {
            setQuery("");
            onChange(null);
            setOpen(true);
          }}
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        className={INPUT}
        placeholder="Search destination"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && (
        <div className="absolute inset-x-0 top-12 z-10 overflow-hidden rounded-ut-md border border-[#e3e8e7] bg-white shadow-ut-2">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-[0.8125rem] text-ut-muted">
              No destinations found — try another city.
            </p>
          ) : (
            results.map((d) => (
              <button
                key={d.slug}
                type="button"
                className="flex w-full cursor-pointer items-center gap-3 border-b border-[#eef1f0] px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-[#eef3f0]"
                onClick={() => {
                  onChange(toChoice(d.slug));
                  setOpen(false);
                }}
              >
                {d.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.image}
                    alt=""
                    className="shrink-0 rounded-md object-cover"
                    style={{ width: 40, height: 28 }}
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="shrink-0 rounded-md"
                    style={{ width: 40, height: 28, background: "linear-gradient(135deg,#0aa56c88,#17242ae0)" }}
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.875rem] font-semibold text-ut-ink">{d.city}</span>
                  <span className="block text-[0.75rem] text-ut-muted">{d.country}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
