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

// ── Types ─────────────────────────────────────────────────────────────

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  timezone: string;
}

export interface AirportAutocompleteProps {
  label: string;
  placeholder: string;
  value: Airport | null;
  onChange: (a: Airport) => void;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────

/** Map city/country names to their primary airport IATA and ICAO codes. */
const CITY_TO_IATA: Record<string, { iata: string; icao: string }> = {
  // Japan
  tokyo: { iata: "NRT", icao: "RJAA" },
  osaka: { iata: "KIX", icao: "RJBB" },
  // Taiwan
  taipei: { iata: "TPE", icao: "RCTP" },
  kaohsiung: { iata: "KHH", icao: "RCKH" },
  // South Korea
  seoul: { iata: "ICN", icao: "RKSI" },
  // China
  beijing: { iata: "PEK", icao: "ZBAA" },
  shanghai: { iata: "PVG", icao: "ZSPD" },
  guangzhou: { iata: "CAN", icao: "ZGGG" },
  hong_kong: { iata: "HKG", icao: "VHHH" },
  "hong kong": { iata: "HKG", icao: "VHHH" },
  // Southeast Asia
  singapore: { iata: "SIN", icao: "WSSS" },
  bangkok: { iata: "BKK", icao: "VTBS" },
  manila: { iata: "MNL", icao: "RPLL" },
  hanoi: { iata: "HAN", icao: "VVNB" },
  "ho chi minh city": { iata: "SGN", icao: "VVTS" },
  kuala_lumpur: { iata: "KUL", icao: "WMKK" },
  bali: { iata: "DPS", icao: "WADD" },
  denpasar: { iata: "DPS", icao: "WADD" },
  jakarta: { iata: "CGK", icao: "WIII" },
  // Europe
  london: { iata: "LHR", icao: "EGLL" },
  paris: { iata: "CDG", icao: "LFPG" },
  amsterdam: { iata: "AMS", icao: "EHAM" },
  berlin: { iata: "BER", icao: "EDDB" },
  munich: { iata: "MUC", icao: "EDDM" },
  rome: { iata: "FCO", icao: "LIRF" },
  madrid: { iata: "MAD", icao: "LEMD" },
  barcelona: { iata: "BCN", icao: "LEBL" },
  zurich: { iata: "ZRH", icao: "LSZH" },
  stockholm: { iata: "ARN", icao: "ESSA" },
  oslo: { iata: "OSL", icao: "ENGM" },
  copenhagen: { iata: "CPH", icao: "EKCH" },
  dublin: { iata: "DUB", icao: "EIDW" },
  // Americas
  "new york": { iata: "JFK", icao: "KJFK" },
  "los angeles": { iata: "LAX", icao: "KLAX" },
  "san francisco": { iata: "SFO", icao: "KSFO" },
  chicago: { iata: "ORD", icao: "KORD" },
  toronto: { iata: "YYZ", icao: "CYYZ" },
  vancouver: { iata: "YVR", icao: "CYVR" },
  "são paulo": { iata: "GRU", icao: "SBGR" },
  "sao paulo": { iata: "GRU", icao: "SBGR" },
  "mexico city": { iata: "MEX", icao: "MMMX" },
  // Middle East / India / Oceania
  dubai: { iata: "DXB", icao: "OMDB" },
  delhi: { iata: "DEL", icao: "VIDP" },
  mumbai: { iata: "BOM", icao: "VABB" },
  sydney: { iata: "SYD", icao: "YSSY" },
  auckland: { iata: "AKL", icao: "NZAA" },
  istanbul: { iata: "IST", icao: "LTFM" },
};

function lookupIata(cityName: string): { iata: string; icao: string } {
  const key = cityName.toLowerCase().trim();
  return CITY_TO_IATA[key] ?? { iata: "", icao: "" };
}

/** Map a raw geocoding result to an Airport shape. */
function toAirport(geo: GeocodingResult): Airport {
  const codes = lookupIata(geo.name);
  return {
    iata: codes.iata,
    icao: codes.icao,
    name: geo.name,
    city: geo.name,
    country: geo.country,
    timezone: geo.timezone,
    latitude: geo.latitude,
    longitude: geo.longitude,
  };
}

// ── Component ─────────────────────────────────────────────────────────

export default function AirportAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  className = "",
  labelClassName = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/90",
  inputClassName = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
}: AirportAutocompleteProps) {
  const [query, setQuery] = useState(
    value ? `${value.city} (${value.iata || "—"})` : "",
  );
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Sync display when parent changes value externally ───────────────
  useEffect(() => {
    if (value) {
      setQuery(`${value.city} (${value.iata || "—"})`);
    }
  }, [value]);

  // ── Debounced search ────────────────────────────────────────────────
  const search = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/geocoding?q=${encodeURIComponent(trimmed)}`,
      );
      if (!res.ok) throw new Error(`Geocoding API returned ${res.status}`);
      const data: GeocodingResult[] = await res.json();
      const sliced = data.slice(0, 6);
      setResults(sliced);
      setIsOpen(sliced.length > 0);
      setHighlightIndex(-1);
    } catch {
      setResults([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(() => debounce(search, 300), [search]);

  // ── Selection ───────────────────────────────────────────────────────
  const select = useCallback(
    (index: number) => {
      const geo = results[index];
      if (!geo) return;
      const airport = toAirport(geo);
      onChange(airport);
      setQuery(`${airport.city} (${airport.iata || "—"})`);
      setIsOpen(false);
      setHighlightIndex(-1);
      inputRef.current?.focus();
    },
    [results, onChange],
  );

  // ── Keyboard navigation ─────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) return;

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
    [isOpen, results.length, highlightIndex, select],
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
        aria-expanded={isOpen}
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
          setQuery(e.target.value);
          debouncedSearch(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        className={inputClassName}
      />

      {isOpen && (
        <ul
          id={listboxId}
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {results.map((r, i) => (
            <li
              key={`${r.name}-${r.countryCode}-${r.latitude}`}
              id={`option-${i}`}
              role="option"
              aria-selected={highlightIndex === i}
              onMouseDown={() => select(i)}
              onMouseEnter={() => setHighlightIndex(i)}
              className={[
                "flex cursor-pointer items-center px-3 py-2 text-sm transition-colors",
                highlightIndex === i
                  ? "bg-blue-100 text-blue-900"
                  : "text-gray-900 hover:bg-gray-100",
              ].join(" ")}
            >
              <span>
                {r.name} · {r.country}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
