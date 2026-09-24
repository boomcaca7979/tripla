"use client";

import { useMemo, useState } from "react";
import { buildFlightSearchUrl } from "@/lib/affiliate";
import AddToTripButton from "./AddToTripButton";
import AffiliateLink from "@/components/analytics/AffiliateLink";

/**
 * FlightSearch — 城市级 Flights 查询（每页仅一个实例，放在酒店推荐上方）。
 *
 * 能力边界（已核实，不假设）：
 *   · 站内价格结果 = Aviasales Data API（缓存价格；需 TRAVELPAYOUTS_API_TOKEN）。
 *     Data API 是缓存数据而非实时报价 → 结果区标注
 *     "Prices from recent Aviasales search data"。
 *   · token 未配置 / 无该路线缓存 / 上游失败 → 诚实空态 + 外部 Aviasales
 *     搜索兜底链接（affiliate 归因不变），绝不伪造结果或估算平均价。
 *   · 只有 Data API 返回的真实 price 才可加入 My Trip（type=flight）。
 *   · 出发地必须由用户显式输入（绝不伪造默认出发地）；仅接受
 *     事实性机场代码（curated 主要城市列表或 3 字母 IATA 直输）。
 *
 * Quiet Commerce：Sponsored · Aviasales 标注 + rel="sponsored noopener noreferrer"。
 */

/** 主要出发城市 → IATA（事实性机场代码，非虚构）。 */
const ORIGIN_CITIES: { city: string; iata: string }[] = [
  { city: "Beijing", iata: "PEK" },
  { city: "Shanghai", iata: "PVG" },
  { city: "Guangzhou", iata: "CAN" },
  { city: "Shenzhen", iata: "SZX" },
  { city: "Chengdu", iata: "TFU" },
  { city: "Hangzhou", iata: "HGH" },
  { city: "Xi'an", iata: "XIY" },
  { city: "Hong Kong", iata: "HKG" },
  { city: "Taipei", iata: "TPE" },
  { city: "Tokyo", iata: "NRT" },
  { city: "Osaka", iata: "KIX" },
  { city: "Seoul", iata: "ICN" },
  { city: "Singapore", iata: "SIN" },
  { city: "Bangkok", iata: "BKK" },
  { city: "Kuala Lumpur", iata: "KUL" },
  { city: "Jakarta", iata: "CGK" },
  { city: "Manila", iata: "MNL" },
  { city: "Hanoi", iata: "HAN" },
  { city: "Ho Chi Minh City", iata: "SGN" },
  { city: "Delhi", iata: "DEL" },
  { city: "Mumbai", iata: "BOM" },
  { city: "Dubai", iata: "DXB" },
  { city: "Doha", iata: "DOH" },
  { city: "Istanbul", iata: "IST" },
  { city: "London", iata: "LHR" },
  { city: "Paris", iata: "CDG" },
  { city: "Frankfurt", iata: "FRA" },
  { city: "Amsterdam", iata: "AMS" },
  { city: "Rome", iata: "FCO" },
  { city: "Madrid", iata: "MAD" },
  { city: "Barcelona", iata: "BCN" },
  { city: "New York", iata: "JFK" },
  { city: "Los Angeles", iata: "LAX" },
  { city: "San Francisco", iata: "SFO" },
  { city: "Toronto", iata: "YYZ" },
  { city: "Vancouver", iata: "YVR" },
  { city: "Sydney", iata: "SYD" },
  { city: "Melbourne", iata: "MEL" },
  { city: "Auckland", iata: "AKL" },
];

function defaultWindow() {
  const depart = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const ret = new Date(Date.now() + 37 * 86400000).toISOString().slice(0, 10);
  return { depart, ret };
}

/** 解析用户输入 → 出发地 IATA（curated 城市名或 3 字母 IATA 直输）；无效返回 null。 */
function resolveOriginIata(raw: string): string | null {
  const q = raw.trim().toLowerCase();
  if (!q) return null;
  const hit = ORIGIN_CITIES.find(
    (o) => o.city.toLowerCase() === q || o.iata.toLowerCase() === q,
  );
  if (hit) return hit.iata;
  return /^[a-z]{3}$/.test(q) ? q.toUpperCase() : null;
}

export default function FlightSearch({
  city,
  destinationIata,
}: {
  city: string;
  destinationIata: string;
}) {
  const [originRaw, setOriginRaw] = useState("");
  const [touched, setTouched] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const initial = useMemo(() => defaultWindow(), []);
  const [departDate, setDepartDate] = useState(initial.depart);
  const [returnDate, setReturnDate] = useState(initial.ret);

  const originIata = resolveOriginIata(originRaw);
  const invalid = touched && originRaw.trim() !== "" && originIata === null;

  // 下拉建议：随输入过滤；空输入时展示全量（弹层自身限高滚动）
  const suggestions = useMemo(() => {
    const q = originRaw.trim().toLowerCase();
    if (!q) return ORIGIN_CITIES;
    return ORIGIN_CITIES.filter(
      (o) => o.city.toLowerCase().includes(q) || o.iata.toLowerCase().includes(q),
    );
  }, [originRaw]);

  const href =
    originIata !== null
      ? buildFlightSearchUrl({ originIata, destinationIata, departDate, returnDate })
      : null;

  // ── 站内价格结果（Aviasales Data API；token 未配置 → 诚实空态 + 外部兜底）
  interface FlightOffer {
    airline?: string;
    flightNumber?: string;
    originAirport?: string;
    destinationAirport?: string;
    departureAt?: string;
    returnAt?: string;
    durationMinutes?: number;
    transfers?: number;
    returnTransfers?: number;
    price: { amount: number; currency: string };
    bookUrl: string;
  }
  type ResultState =
    | { phase: "idle" }
    | { phase: "loading" }
    | {
        phase: "ready";
        available: boolean;
        reason?: string;
        tripType?: "round-trip" | "one-way";
        flights?: FlightOffer[];
      }
    | { phase: "error" };
  const [result, setResult] = useState<ResultState>({ phase: "idle" });

  function searchPrices() {
    if (originIata === null) return;
    setResult({ phase: "loading" });
    const qs = new URLSearchParams({
      origin: originIata,
      destination: destinationIata,
      departDate,
      returnDate,
    });
    fetch(`/api/flight-prices?${qs.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then(
        (body: {
          available?: boolean;
          reason?: string;
          tripType?: "round-trip" | "one-way";
          flights?: FlightOffer[];
        }) => {
          setResult({
            phase: "ready",
            available: body.available === true,
            reason: body.reason,
            tripType: body.tripType,
            flights: Array.isArray(body.flights) ? body.flights : [],
          });
        },
      )
      .catch(() => setResult({ phase: "error" }));
  }

  function fmtTime(iso?: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? iso
      : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  function fmtDuration(min?: number): string {
    if (typeof min !== "number" || min <= 0) return "";
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  return (
    <div className="rounded-ut-md border border-ut-border bg-ut-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-mono text-micro uppercase tracking-[0.16em] text-ut-text-2">
          Flights
        </p>
        <span className="font-mono text-micro uppercase tracking-[0.14em] text-ut-muted">
          Sponsored · Aviasales
        </span>
      </div>

      <h3 className="mt-3 font-display text-[22px] leading-tight text-ut-ink">
        Search flights to {city}
      </h3>
      <p className="mt-2 max-w-[56ch] text-label leading-relaxed text-ut-text-2">
        Enter your origin and travel dates — live fares open on Aviasales in a new tab.
        Fares are shown by the provider; none are displayed or estimated on this page.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="relative block">
          <label className="block">
            <span className="font-mono text-micro uppercase tracking-[0.14em] text-ut-text-2">
              Origin
            </span>
            <input
              type="text"
              value={originRaw}
              onChange={(e) => {
                setOriginRaw(e.target.value);
                setTouched(true);
                setListOpen(true);
              }}
              onFocus={() => setListOpen(true)}
              onBlur={() => setListOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setListOpen(false);
              }}
              role="combobox"
              aria-expanded={listOpen}
              aria-autocomplete="list"
              placeholder="e.g. Beijing, or a 3-letter airport code"
              aria-invalid={invalid}
              className="mt-1.5 min-h-[44px] w-full rounded-[4px] border border-ut-border bg-ut-bg px-3 text-body text-ut-text placeholder:text-ut-muted focus-visible:outline-2 focus-visible:outline-ut-accent"
            />
          </label>
          {listOpen && suggestions.length > 0 && (
            <ul
              role="listbox"
              className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-[260px] overflow-y-auto rounded-ut-md border border-ut-border bg-ut-bg py-1 shadow-ut-2 [scrollbar-width:thin] [scrollbar-color:var(--ut-border-strong,transparent)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-ut-border [&::-webkit-scrollbar-track]:bg-transparent"
            >
              {suggestions.map((o) => (
                <li key={o.iata}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={originIata === o.iata}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setOriginRaw(o.city);
                      setTouched(true);
                      setListOpen(false);
                    }}
                    className="flex w-full items-baseline justify-between gap-3 px-3.5 py-2.5 text-left text-label leading-snug text-ut-text transition-colors hover:bg-ut-surface-hover"
                  >
                    <span className="min-w-0 truncate">{o.city}</span>
                    <span className="shrink-0 font-mono text-micro uppercase tracking-[0.14em] text-ut-muted">
                      {o.iata}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <label className="block">
          <span className="font-mono text-micro uppercase tracking-[0.14em] text-ut-text-2">
            Depart
          </span>
          <input
            type="date"
            value={departDate}
            onChange={(e) => setDepartDate(e.target.value)}
            className="mt-1.5 min-h-[44px] rounded-[4px] border border-ut-border bg-ut-bg px-3 text-body text-ut-text focus-visible:outline-2 focus-visible:outline-ut-accent"
          />
        </label>
        <label className="block">
          <span className="font-mono text-micro uppercase tracking-[0.14em] text-ut-text-2">
            Return
          </span>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="mt-1.5 min-h-[44px] rounded-[4px] border border-ut-border bg-ut-bg px-3 text-body text-ut-text focus-visible:outline-2 focus-visible:outline-ut-accent"
          />
        </label>
      </div>

      {invalid && (
        <p role="alert" className="mt-3 text-label text-ut-verdict-challenging">
          Choose a city from the suggestions, or enter a 3-letter airport code (e.g. PVG).
        </p>
      )}

      <div className="mt-5">
        {originIata ? (
          <button
            type="button"
            onClick={searchPrices}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[4px] bg-ut-accent px-5 py-3 text-body font-medium text-white transition-colors hover:bg-ut-accent-strong"
          >
            {result.phase === "loading" ? "Searching…" : "Search flights"}
            <span aria-hidden="true">→</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex min-h-[44px] cursor-not-allowed items-center gap-2 rounded-[4px] bg-ut-accent px-5 py-3 text-body font-medium text-white opacity-50"
          >
            Search flights
            <span aria-hidden="true">→</span>
          </button>
        )}
        {originIata && (
          <p className="mt-2 font-mono text-micro uppercase tracking-[0.14em] text-ut-muted">
            {originIata} → {destinationIata}
          </p>
        )}
      </div>

      {/* ── 站内结果区（Data API 缓存价格；诚实空态 + 外部兜底） ── */}
      {result.phase === "ready" && result.available && result.flights && (
        <div className="mt-6" data-flight-results>
          <p className="font-mono text-micro uppercase tracking-[0.14em] text-ut-muted">
            {result.tripType === "one-way"
              ? "One-way fares · Prices from recent Aviasales search data"
              : "Prices from recent Aviasales search data"}
          </p>
          <ul className="mt-3 space-y-2.5">
            {result.flights.map((f, i) => (
              <li
                key={`${f.airline ?? "na"}-${f.flightNumber ?? i}-${i}`}
                className="flex flex-col gap-2 rounded-[4px] border border-ut-border bg-ut-bg p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-label font-bold leading-snug text-ut-text">
                    {f.airline ?? "Airline unavailable"}
                    {f.flightNumber ? ` · ${f.flightNumber}` : ""}
                  </p>
                  <p className="mt-0.5 text-micro text-ut-text-2">
                    {f.departureAt
                      ? `${f.originAirport ?? originIata} ${fmtTime(f.departureAt)} → ${f.destinationAirport ?? destinationIata}${f.durationMinutes ? ` ${fmtTime(new Date(new Date(f.departureAt).getTime() + f.durationMinutes * 60000).toISOString())}` : ""}`
                      : "Departure unavailable"}
                  </p>
                  <p className="mt-0.5 font-mono text-micro uppercase tracking-[0.1em] text-ut-muted">
                    {[
                      fmtDuration(f.durationMinutes),
                      f.returnAt ? `Return ${fmtTime(f.returnAt)}` : null,
                      typeof f.transfers === "number"
                        ? f.transfers === 0
                          ? "Nonstop"
                          : `${f.transfers} stop${f.transfers === 1 ? "" : "s"}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <p className="text-label font-bold text-ut-ink">
                    {f.price.currency} {f.price.amount.toLocaleString()}
                  </p>
                  <AffiliateLink
                    href={f.bookUrl}
                    category="flight"
                    provider="aviasales"
                    destination={destinationIata}
                    identifier={f.flightNumber}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="inline-flex min-h-[30px] items-center gap-1 rounded-[4px] bg-ut-accent px-2.5 py-1 text-micro font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-ut-accent-strong"
                  >
                    Book <span aria-hidden="true">→</span>
                  </AffiliateLink>
                  <AddToTripButton
                    type="flight"
                    name={`Flight ${originIata} → ${destinationIata} · ${f.departureAt ?? departDate}${f.airline ? ` · ${f.airline}` : ""}`}
                    affiliateUrl={f.bookUrl}
                    price={f.price}
                    variant="compact"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {result.phase === "ready" && !result.available && (
        <div className="mt-6" data-flight-empty>
          <p className="text-label leading-relaxed text-ut-text-2">
            {result.reason === "token-not-configured"
              ? "Flight price results aren't available yet — the fare data provider isn't configured for this site."
              : result.reason === "no-results"
                ? "No recent fare data is available for this route."
                : result.reason === "auth-error"
                  ? "Flight fare data is temporarily unavailable (provider authentication)."
                  : result.reason === "rate-limited"
                    ? "Flight fare data is temporarily unavailable (provider rate limit). Try again shortly."
                    : "Flight price data is unavailable right now."}
          </p>
          <AffiliateLink
            href={href ?? "#"}
            category="flight"
            provider="aviasales"
            destination={destinationIata}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="mt-3 inline-flex min-h-[38px] items-center gap-2 rounded-[4px] border border-ut-border-strong px-4 py-2 text-label font-medium text-ut-text transition-colors hover:bg-ut-surface-hover"
          >
            Search flights on Aviasales <span aria-hidden="true">→</span>
          </AffiliateLink>
        </div>
      )}
      {result.phase === "error" && (
        <p className="mt-6 text-label text-ut-text-2" data-flight-empty>
          Flight price data is unavailable right now.
        </p>
      )}
    </div>
  );
}
