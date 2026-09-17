"use client";

import {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
  type KeyboardEvent,
} from "react";
import { debounce } from "@/lib/utils";
import type { Airport } from "@/types/flight";

/**
 * AirportAutocomplete — 城市优先的目的地搜索（本轮修正）。
 *
 * 修正内容：普通用户不再需要知道机场三字码。
 *   · 输入城市名即可（"Tokyo" / "New York" / "Paris" / "Bali" / "London"）。
 *   · 候选项同时给出城市与国家，以及该城市的机场（代码只出现在候选项/机场信息里）。
 *   · 本地城市索引（由 server 传入，来自 145 个目的地数据）先本地匹配，命中不了
 *     再回退到既有 geocoding API —— 不新建第二套搜索组件。
 *
 * 选择后输入框显示"城市, 国家"，机场代码只作为候选项信息保留。
 */

// ── Types ─────────────────────────────────────────────────────────────

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  timezone: string;
}

/** 候选项（统一本地索引与 geocoding 结果两种来源）。 */
interface Candidate {
  key: string;
  city: string;
  country: string;
  /** 该城市已知机场（代码仅作信息展示）。 */
  airports: { iata: string; icao: string; name: string }[];
  timezone: string;
  latitude: number;
  longitude: number;
  /** 主机场（选择时写入 Airport 的字段来源）。 */
  primary: { iata: string; icao: string; name: string };
}

export interface CityIndexEntry {
  city: string;
  country: string;
  iata: string;
  icao: string;
  airportName: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

export interface AirportAutocompleteProps {
  label: string;
  placeholder: string;
  value: Airport | null;
  onChange: (a: Airport) => void;
  /** 本地城市索引（来自 145 个目的地数据）；缺省时退化为纯 geocoding 搜索。 */
  cityIndex?: CityIndexEntry[];
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * 多机场城市（真实民航事实：一座城市有多个机场时在候选项里全部列出）。
 * 只用于**候选项信息**与候选机场清单，不改变主机场选择逻辑。
 */
const CITY_EXTRA_AIRPORTS: Record<string, { iata: string; icao: string; name: string }[]> = {
  tokyo: [
    { iata: "HND", icao: "RJTT", name: "Haneda Airport" },
    { iata: "NRT", icao: "RJAA", name: "Narita International Airport" },
  ],
  "new york": [
    { iata: "JFK", icao: "KJFK", name: "John F. Kennedy International Airport" },
    { iata: "LGA", icao: "KLGA", name: "LaGuardia Airport" },
    { iata: "EWR", icao: "KEWR", name: "Newark Liberty International Airport" },
  ],
  london: [
    { iata: "LHR", icao: "EGLL", name: "Heathrow Airport" },
    { iata: "LGW", icao: "EGKK", name: "Gatwick Airport" },
    { iata: "STN", icao: "EGSS", name: "Stansted Airport" },
  ],
  paris: [
    { iata: "CDG", icao: "LFPG", name: "Charles de Gaulle Airport" },
    { iata: "ORY", icao: "LFPO", name: "Orly Airport" },
  ],
  milan: [
    { iata: "MXP", icao: "LIMC", name: "Malpensa Airport" },
    { iata: "LIN", icao: "LIML", name: "Linate Airport" },
  ],
  rome: [
    { iata: "FCO", icao: "LIRF", name: "Leonardo da Vinci–Fiumicino Airport" },
    { iata: "CIA", icao: "LIRA", name: "Ciampino Airport" },
  ],
  "são paulo": [
    { iata: "GRU", icao: "SBGR", name: "Guarulhos International Airport" },
    { iata: "CGH", icao: "SBSP", name: "Congonhas Airport" },
  ],
  moscow: [
    { iata: "SVO", icao: "UUEE", name: "Sheremetyevo International Airport" },
    { iata: "DME", icao: "UUDD", name: "Domodedovo International Airport" },
  ],
  shanghai: [
    { iata: "PVG", icao: "ZSPD", name: "Pudong International Airport" },
    { iata: "SHA", icao: "ZSSS", name: "Hongqiao International Airport" },
  ],
  beijing: [
    { iata: "PEK", icao: "ZBAA", name: "Beijing Capital International Airport" },
    { iata: "PKX", icao: "ZBAD", name: "Beijing Daxing International Airport" },
  ],
  osaka: [
    { iata: "KIX", icao: "RJBB", name: "Kansai International Airport" },
    { iata: "ITM", icao: "RJOO", name: "Itami Airport" },
  ],
  istanbul: [
    { iata: "IST", icao: "LTFM", name: "Istanbul Airport" },
    { iata: "SAW", icao: "LTFJ", name: "Sabiha Gökçen Airport" },
  ],
  "kuala lumpur": [
    { iata: "KUL", icao: "WMKK", name: "Kuala Lumpur International Airport" },
    { iata: "SZB", icao: "WMSA", name: "Sultan Abdul Aziz Shah Airport" },
  ],
};

function normalizeCityKey(name: string): string {
  return name.toLowerCase().trim();
}

/** 城市索引 + 多机场表 → 候选项（主机场取索引里的真实主机场）。 */
function candidateFromIndex(entry: CityIndexEntry): Candidate {
  const key = normalizeCityKey(entry.city);
  const extras = CITY_EXTRA_AIRPORTS[key] ?? [];
  const primary = { iata: entry.iata, icao: entry.icao, name: entry.airportName };
  const airports = extras.length > 0
    ? extras
    : [primary];
  return {
    key: `${key}-${entry.country}`,
    city: entry.city,
    country: entry.country,
    airports,
    timezone: entry.timezone,
    latitude: entry.latitude,
    longitude: entry.longitude,
    primary,
  };
}

/** geocoding 结果 → 候选项（非索引城市回退路径）。 */
function candidateFromGeo(geo: GeocodingResult): Candidate {
  const key = normalizeCityKey(geo.name);
  const extras = CITY_EXTRA_AIRPORTS[key] ?? [];
  const primary = extras[0] ?? { iata: "", icao: "", name: "" };
  return {
    key: `${key}-${geo.countryCode}-${geo.latitude}`,
    city: geo.name,
    country: geo.country,
    airports: extras,
    timezone: geo.timezone,
    latitude: geo.latitude,
    longitude: geo.longitude,
    primary,
  };
}

function toAirport(c: Candidate): Airport {
  return {
    iata: c.primary.iata,
    icao: c.primary.icao,
    name: c.primary.name || c.city,
    city: c.city,
    country: c.country,
    timezone: c.timezone,
    latitude: c.latitude,
    longitude: c.longitude,
  };
}

/** 输入框的展示文本：城市名优先（未选时为空）。 */
function displayLabel(city: string, country: string): string {
  return country ? `${city}, ${country}` : city;
}

// ── Component ─────────────────────────────────────────────────────────

export default function AirportAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  cityIndex = [],
  className = "",
  labelClassName = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/90",
  inputClassName = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
}: AirportAutocompleteProps) {
  const [query, setQuery] = useState(
    value ? displayLabel(value.city, value.country) : "",
  );
  const [remote, setRemote] = useState<Candidate[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const indexed = useMemo(() => cityIndex.map(candidateFromIndex), [cityIndex]);

  // ── Sync display when parent changes value externally ───────────────
  useEffect(() => {
    if (value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 父组件外部变更 value 时同步显示（prop → state 同步）
      setQuery(displayLabel(value.city, value.country));
    }
  }, [value]);

  // ── 本地城市匹配（无网络）：城市名 / 国家名子串，前缀命中优先 ────────
  const localMatches = useMemo(() => {
    const q = normalizeCityKey(query);
    if (q.length < 2) return [];
    const prefix: Candidate[] = [];
    const contains: Candidate[] = [];
    for (const c of indexed) {
      const city = normalizeCityKey(c.city);
      const country = normalizeCityKey(c.country);
      if (city.startsWith(q)) prefix.push(c);
      else if (city.includes(q) || country.includes(q)) contains.push(c);
    }
    return [...prefix, ...contains];
  }, [indexed, query]);

  // ── 远端 geocoding 回退（本地索引未覆盖的城市） ─────────────────────
  const search = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setRemote([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/geocoding?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error(`Geocoding API returned ${res.status}`);
      const data: GeocodingResult[] = await res.json();
      setRemote(data.map(candidateFromGeo));
    } catch {
      setRemote([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(() => debounce(search, 300), [search]);

  // 候选项：本地城市索引命中即用本地（145 个目的地数据，无网络、无噪声）；
  // 本地无命中时才回退到 geocoding（覆盖索引外的城市）。最多 6 条。
  const results = useMemo(() => {
    const source = localMatches.length > 0 ? localMatches : remote;
    const seen = new Set<string>();
    const out: Candidate[] = [];
    for (const c of source) {
      const dedupe = normalizeCityKey(c.city);
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      out.push(c);
      if (out.length >= 6) break;
    }
    return out;
  }, [localMatches, remote]);

  const open = isOpen && results.length > 0;

  // ── Selection ───────────────────────────────────────────────────────
  const select = useCallback(
    (index: number) => {
      const c = results[index];
      if (!c) return;
      const airport = toAirport(c);
      onChange(airport);
      setQuery(displayLabel(airport.city, airport.country));
      setIsOpen(false);
      setHighlightIndex(-1);
      inputRef.current?.focus();
    },
    [results, onChange],
  );

  // ── Keyboard navigation ─────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setHighlightIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0,
          );
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setHighlightIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1,
          );
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (highlightIndex >= 0 && highlightIndex < results.length) {
            select(highlightIndex);
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          setIsOpen(false);
          setHighlightIndex(-1);
          break;
        }
      }
    },
    [open, results.length, highlightIndex, select],
  );

  // ── Close on outside click ──────────────────────────────────────────
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────
  const listboxId = "airport-autocomplete-listbox";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className={labelClassName}>
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={
          highlightIndex >= 0 ? `option-${highlightIndex}` : undefined
        }
        aria-haspopup="listbox"
        aria-autocomplete="list"
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          const next = e.target.value;
          setQuery(next);
          setIsOpen(next.trim().length >= 2);
          debouncedSearch(next);
        }}
        onFocus={() => {
          if (query.trim().length >= 2) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className={inputClassName}
      />

      {open && (
        <ul
          id={listboxId}
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {results.map((r, i) => (
            <li
              key={r.key}
              id={`option-${i}`}
              role="option"
              aria-selected={highlightIndex === i}
              onMouseDown={() => select(i)}
              onMouseEnter={() => setHighlightIndex(i)}
              className={[
                "flex cursor-pointer flex-col gap-0.5 px-3 py-2 text-sm transition-colors",
                highlightIndex === i
                  ? "bg-blue-100 text-blue-900"
                  : "text-gray-900 hover:bg-gray-100",
              ].join(" ")}
            >
              <span className="font-medium">
                {r.city}
                {r.country ? `, ${r.country}` : ""}
              </span>
              {/* 机场代码只出现在候选项的机场信息里 */}
              <span className="font-mono text-[11px] uppercase tracking-wide text-gray-500">
                {r.airports.length > 0
                  ? r.airports
                      .map((a) => (a.iata ? `${a.name} (${a.iata})` : a.name))
                      .join(" · ")
                  : "No airport code on record for this city"}
              </span>
            </li>
          ))}
          {loading && results.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500">Searching cities…</li>
          )}
        </ul>
      )}
    </div>
  );
}
