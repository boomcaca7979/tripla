/**
 * expenses/engine — Travel Expenses 的计算与识别引擎（纯函数，无 React）。
 *
 * 包含：
 *  1. 币种元数据 + 金额格式化（原始金额永远保留，不伪造实时汇率）；
 *  2. Merchant normalization（7-ELEVEN #1234 → 7-Eleven，原始描述保留）；
 *  3. 自动分类：用户规则 > 商户别名精确规则 > 关键词规则（模型辅助层预留接口）；
 *  4. 自动 Trip matching（日期 + 目的地/国家文本 + 币种 → 置信度）；
 *  5. 去重（source + sourceTransactionId + date + merchant + amount + currency）；
 *  6. CSV / XLSX 解析 + 字段自动映射（XLSX 为本地 ZIP+inflate 解析，零依赖）；
 *  7. Split 结算（equal / amount / percentage，支持不等额）；
 *  8. 旧 Expense 数据迁移（expense → Transaction, source=manual, status=confirmed）。
 */

import type {
  ExpenseCategory,
  Trip,
  Traveler,
  WorkspaceState,
} from "../types";
import type {
  MerchantRule,
  Transaction,
  TransactionSource,
} from "./types";
import { localId } from "../logic";

// ── 1. 币种 ──────────────────────────────────────────────────────────

export interface CurrencyMeta {
  code: string;
  symbol: string;
  label: string;
}

/** 交易层使用的币种（code 计）； trips 老数据用符号（¥/$/€/£） */
export const CURRENCIES: CurrencyMeta[] = [
  { code: "THB", symbol: "฿", label: "Thai Baht" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar" },
  { code: "HKD", symbol: "HK$", label: "Hong Kong Dollar" },
  { code: "KRW", symbol: "₩", label: "Korean Won" },
  { code: "MYR", symbol: "RM", label: "Malaysian Ringgit" },
  { code: "VND", symbol: "₫", label: "Vietnamese Dong" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
];

/** 兼容旧 Trip.currency 符号 → 默认 code（¥ 上下文优先按 CNY 处理不了，取 JPY 由 Trip 国别决定；此处保守取 CNY） */
export const SYMBOL_TO_CODE: Record<string, string> = {
  "¥": "CNY",
  $: "USD",
  "€": "EUR",
  "£": "GBP",
  "฿": "THB",
};

export function codeForSymbol(symbol: string): string {
  return SYMBOL_TO_CODE[symbol] ?? symbol;
}

export function symbolFor(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

function decimalsFor(code: string): number {
  // 零小数位币种
  if (code === "JPY" || code === "KRW" || code === "VND") return 0;
  return 2;
}

/** "฿1,280" / "¥18,640" / "USD 12.40" —— 兼容 code 与旧符号输入 */
export function money(amount: number, currency: string): string {
  const symbol = symbolFor(currency);
  const dec = decimalsFor(currency);
  const abs = Math.abs(amount);
  // 整数不拖 .00（spec #39：฿182 而非 ฿182.00）；有小数时按币种精度显示（$32.50）
  const body = abs.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(abs) ? 0 : dec,
    maximumFractionDigits: dec,
  });
  return `${amount < 0 ? "-" : ""}${symbol}${body}`;
}

/** 分类聚合时的显示金额：优先 convertedAmount，否则原始金额（未填金额 = 0，不计入统计） */
export function displayAmount(t: Transaction): number {
  return t.convertedAmount ?? t.originalAmount ?? 0;
}

/** 该交易是否已有真实金额（draft 快速记录可能还没有） */
export function hasAmount(t: Transaction): boolean {
  return typeof (t.convertedAmount ?? t.originalAmount) === "number";
}

/** 分类聚合时的显示币种 */
export function displayCurrency(t: Transaction): string {
  return t.convertedCurrency ?? t.originalCurrency;
}

// ── 1.5 Quick capture 自然语言解析（Capture first → Organize later） ──

/** 快速捕获解析结果：其余字段（分类/Trip/人物）都在记录之后整理 */
export interface QuickCapture {
  /** 去掉金额/币种/时间后的标题（可为空——只写金额也算一条） */
  title: string;
  amount?: number;
  /** 仅当文本里识别出币种时才有值；否则由调用方用 Trip 币种兜底 */
  currency?: string;
  /** 行首时间（Itinerary 的 "15:00 Grand Palace"） */
  time?: string;
}

/** 可识别的 ISO 币种 token（"Dinner 850 THB"） */
const QUICK_CURRENCY_TOKENS = new Set([
  "THB", "CNY", "JPY", "USD", "EUR", "GBP", "SGD", "HKD", "KRW", "VND", "TWD", "MYR", "IDR", "PHP", "INR", "AUD", "CAD", "CHF",
]);

/**
 * 解析一句自然语言输入：
 *   "Dinner 850"        → Dinner + 850
 *   "Grab 240 THB"      → Grab + 240 + THB
 *   "Dinner $32.50"     → Dinner + 32.5 + USD
 *   "Mango sticky rice ฿80" → 全标题 + 80 + THB
 *   "Amazing seafood"   → 纯标题（draft）
 *   "350"               → 纯金额（draft，无标题）
 *   "15:00 Grand Palace"→ time 15:00 + 标题
 * 不要求固定格式：解析不出的部分一律归入标题。
 */
export function parseQuickCapture(text: string): QuickCapture {
  const raw = text.trim();
  if (!raw) return { title: "" };
  const tokens = raw.split(/\s+/);
  const rest: string[] = [];
  let time: string | undefined;
  let amount: number | undefined;
  let currency: string | undefined;

  for (let i = 0; i < tokens.length; i++) {
    const tk = tokens[i];
    // 行首时间（HH:MM 或 H:MM）
    if (!time && /^\d{1,2}:\d{2}$/.test(tk)) {
      time = tk.length === 4 ? `0${tk}` : tk;
      continue;
    }
    // 独立 ISO 币种 token（紧跟在金额前后）
    const upper = tk.toUpperCase();
    if (QUICK_CURRENCY_TOKENS.has(upper) && upper.length >= 3) {
      if (amount !== undefined && !currency) currency = upper;
      else if (amount !== undefined) rest.push(tk);
      else rest.push(tk);
      continue;
    }
    // 金额（可带货币符号前/后缀："฿80" / "$32.50" / "80฿"）
    const m = tk.match(/^([฿$¥€£])?(\d[\d,]*(?:\.\d+)?)([฿$¥€£])?$/);
    if (m) {
      const v = Number(m[2].replaceAll(",", ""));
      if (v > 0 && amount === undefined) {
        amount = v;
        const sym = m[1] ?? m[3];
        if (sym) currency = SYMBOL_TO_CODE[sym];
        continue;
      }
    }
    rest.push(tk);
  }

  // 只写了币种没写金额 → 币种归入标题，不当金额用
  return {
    title: rest.join(" "),
    amount,
    currency: amount !== undefined ? currency : undefined,
    time,
  };
}

// ── 2. Merchant normalization ────────────────────────────────────────

/** 已知商户别名表：normalize 后的 key → 规范显示名 */
const MERCHANT_ALIASES: Record<string, string> = {
  "7 eleven": "7-Eleven",
  "7eleven": "7-Eleven",
  "7-eleven": "7-Eleven",
  "seven eleven": "7-Eleven",
  grab: "Grab",
  grabtaxi: "Grab",
  starbucks: "Starbucks",
  familymart: "FamilyMart",
  "family mart": "FamilyMart",
  lawson: "Lawson",
  circlek: "Circle K",
  "circle k": "Circle K",
  mcdonalds: "McDonald's",
  mcd: "McDonald's",
  "don quijote": "Don Quijote",
  donquijote: "Don Quijote",
  uniqlo: "UNIQLO",
  muji: "MUJI",
  "chat ramen": "Ramen",
};

/**
 * 商户规范化：小写、去 punctuation、去门店号（#1234 / 1234 结尾）、collapse spaces。
 * 返回 [normalizedKey, 原始描述保留]。
 */
export function normalizeMerchant(raw: string): string {
  let s = raw.toLowerCase().trim();
  s = s.replace(/[#*_]/g, " ");
  // 去掉卡号 / 门店号尾巴（连续 3+ 位数字段，如 "7-eleven 1234" / "pos 000123"）
  s = s
    .split(/\s+/)
    .filter((tok) => !(tok.length >= 3 && /^\d{3,}$/.test(tok)))
    .join(" ");
  s = s.replace(/[^a-z0-9\u4e00-\u9fff-]+/g, " ").replace(/\s+/g, " ").trim();
  return s;
}

/** 规范显示名：命中别名表用规范名，否则 Title Case 原始输入 */
export function merchantDisplayName(raw: string): string {
  const key = normalizeMerchant(raw);
  const aliased = MERCHANT_ALIASES[key];
  if (aliased) return aliased;
  // "GRAB BANGKOK" → "Grab Bangkok"（保留原始词序）
  return raw
    .trim()
    .split(/\s+/)
    .map((w) =>
      w.length > 2 && w === w.toUpperCase()
        ? w.charAt(0) + w.slice(1).toLowerCase()
        : w,
    )
    .join(" ");
}

/**
 * 品牌键：商户 key 的已知品牌前缀（最长优先命中）。
 * "grab bangkok" → "grab"；用于分类学习的品牌级泛化（spec #40）。
 */
export function brandKeyOf(normalizedKey: string): string | null {
  const keys = Object.keys(MERCHANT_ALIASES).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (normalizedKey === k || normalizedKey.startsWith(`${k} `)) return k;
  }
  return null;
}

// ── 3. 自动分类 ──────────────────────────────────────────────────────

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: "Food",
  transport: "Transport",
  stay: "Stay",
  tickets: "Tickets",
  activities: "Activities",
  shopping: "Shopping",
  entertainment: "Entertainment",
  health: "Health",
  fees: "Fees",
  other: "Other",
};

/** 二级分类（保持简单，每类 2-4 个） */
export const SUBCATEGORY_OPTIONS: Record<ExpenseCategory, string[]> = {
  food: ["Dining", "Snacks", "Drinks", "Coffee"],
  transport: ["Ride", "Transit", "Flight", "Fuel"],
  stay: ["Hotel", "Hostel", "Vacation rental"],
  tickets: ["Attraction", "Event"],
  activities: ["Tour", "Experience", "Class"],
  shopping: ["Clothing", "Souvenirs", "Market"],
  entertainment: ["Bar", "Nightlife", "Cinema"],
  health: ["Pharmacy", "Clinic"],
  fees: ["ATM", "Exchange", "Service charge"],
  other: [],
};

export interface CategorySuggestion {
  category: ExpenseCategory;
  subcategory?: string;
  confidence: number;
  /** 命中来源：user rule / merchant alias / keyword */
  via: "user-rule" | "merchant" | "keyword";
}

/** 关键词规则（命中 normalized merchant + 原始描述文本） */
const KEYWORD_RULES: Array<{
  keywords: string[];
  category: ExpenseCategory;
  subcategory?: string;
}> = [
  { keywords: ["7-eleven", "seven eleven", "7 eleven", "familymart", "family mart", "lawson", "circle k", "convenience", "ministop"], category: "food", subcategory: "Snacks" },
  { keywords: ["starbucks", "coffee", "cafe", "café"], category: "food", subcategory: "Coffee" },
  { keywords: ["ramen", "sushi", "restaurant", "kitchen", "noodle", "izakaya", "bbq", "food", "hawker", "street food", "dining", "lunch", "dinner", "breakfast", "pizza", "burger"], category: "food", subcategory: "Dining" },
  { keywords: ["grab", "uber", "gojek", "taxi", "bolt", "lyft", "did"], category: "transport", subcategory: "Ride" },
  { keywords: ["mrt", "bts", "metro", "subway", "train", "rail", "bus", "suica", "octopus", "transit", "ferry", "tram"], category: "transport", subcategory: "Transit" },
  { keywords: ["airways", "airlines", "airasia", "flight", "airport express"], category: "transport", subcategory: "Flight" },
  { keywords: ["hotel", "hostel", "inn", "resort", "airbnb", "ryokan", "lodging", "guesthouse"], category: "stay", subcategory: "Hotel" },
  { keywords: ["palace", "temple", "museum", "aquarium", "zoo", "admission", "ticket", "skytree", "observation"], category: "tickets", subcategory: "Attraction" },
  { keywords: ["park", "pier", "cable car", "ropeway"], category: "tickets", subcategory: "Attraction" },
  { keywords: ["tour", "experience", "workshop", "class", "cooking", "diving", "snorkel", "safari"], category: "activities" },
  { keywords: ["mall", "market", "shop", "store", "uniqlo", "muji", "souvenir", "boutique", "dept"], category: "shopping" },
  { keywords: ["cinema", "movie", "karaoke", "bar ", "pub", "club", "nightclub", "live house"], category: "entertainment" },
  { keywords: ["pharmacy", "drugstore", "clinic", "hospital", "medical"], category: "health" },
  { keywords: ["atm", "withdrawal", "commission", "exchange", "service charge", "transaction fee", "bank fee"], category: "fees" },
];

/** 模型辅助层（预留）：当前项目没有可用的本地分类模型 → 恒返回 null。
 *  未来接入时在此返回 { category, subcategory, confidence, reason }。 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function modelClassify(_merchant: string, _raw: string): CategorySuggestion | null {
  return null;
}

/**
 * 自动分类。优先级：用户规则（learning）> 商户别名 > 关键词 > 模型 > other(0)。
 */
export function suggestCategory(
  merchant: string,
  raw: string,
  rules: Record<string, MerchantRule>,
): CategorySuggestion {
  const key = normalizeMerchant(merchant || raw);
  // 第一优先：用户纠正学到的规则（精确商户 → 品牌级泛化）
  const userRule = rules[key] ?? rules[brandKeyOf(key) ?? ""];
  if (userRule) {
    return {
      category: userRule.category,
      subcategory: userRule.subcategory,
      confidence: 0.99,
      via: "user-rule",
    };
  }
  // 第二：商户别名精确命中（别名表内有独立分类的商户）
  const aliasRule = MERCHANT_CATEGORY_RULES[key];
  if (aliasRule) {
    return { ...aliasRule, confidence: 0.96, via: "merchant" };
  }
  // 第三：关键词规则
  const text = `${key} ${(raw || "").toLowerCase()}`;
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return {
        category: rule.category,
        subcategory: rule.subcategory,
        confidence: 0.85,
        via: "keyword",
      };
    }
  }
  // 第四：模型辅助（当前恒 null）
  const model = modelClassify(merchant, raw);
  if (model) return model;
  return { category: "other", confidence: 0, via: "keyword" };
}

/** 有明确分类的商户别名（其余别名只做显示规范化） */
const MERCHANT_CATEGORY_RULES: Record<string, Omit<CategorySuggestion, "confidence" | "via">> = {
  "7-eleven": { category: "food", subcategory: "Snacks" },
  "7 eleven": { category: "food", subcategory: "Snacks" },
  "seven eleven": { category: "food", subcategory: "Snacks" },
  grab: { category: "transport", subcategory: "Ride" },
  starbucks: { category: "food", subcategory: "Coffee" },
  familymart: { category: "food", subcategory: "Snacks" },
  lawson: { category: "food", subcategory: "Snacks" },
  uniqlo: { category: "shopping" },
  muji: { category: "shopping" },
};

// ── 4. 自动 Trip matching ────────────────────────────────────────────

export interface TripSuggestion {
  tripId: string;
  confidence: number; // 0-1
}

/**
 * Trip 匹配（绝不自动强行归属，结果必须经 Review）：
 *  - 日期落在 trip 区间内：+0.55
 *  - 商户/描述文本包含目的地城市名：+0.30；包含国家名：+0.25（两者取高）
 *  - 币种匹配 trip 计价：+0.15
 *  - 建议门槛：>= 0.5
 */
export function suggestTrip(
  occurredAt: string,
  merchant: string,
  raw: string,
  originalCurrency: string,
  trips: Trip[],
): TripSuggestion | null {
  let best: TripSuggestion | null = null;
  const text = `${merchant} ${raw}`.toLowerCase();
  for (const trip of trips) {
    let score = 0;
    if (
      occurredAt &&
      occurredAt >= trip.startDate &&
      occurredAt <= trip.endDate
    ) {
      score += 0.55;
    }
    const dest = trip.destination.toLowerCase();
    const country = trip.country?.toLowerCase() ?? "";
    const textScore = Math.max(
      dest.length >= 3 && text.includes(dest) ? 0.3 : 0,
      country.length >= 3 && text.includes(country) ? 0.25 : 0,
    );
    score += textScore;
    const tripCurrencyCode = codeForSymbol(trip.currency);
    if (tripCurrencyCode === originalCurrency || trip.currency === originalCurrency) {
      score += 0.15;
    }
    score = Math.min(score, 0.99);
    if (score >= 0.5 && (!best || score > best.confidence)) {
      best = { tripId: trip.id, confidence: score };
    }
  }
  return best;
}

// ── 5. 去重 ──────────────────────────────────────────────────────────

export interface DedupeKeyInput {
  source: TransactionSource;
  sourceTransactionId?: string;
  occurredAt: string;
  merchant: string;
  originalAmount?: number;
  originalCurrency: string;
}

export function dedupeKeyOf(t: DedupeKeyInput): string {
  return [
    t.source,
    t.sourceTransactionId ?? "-",
    t.occurredAt,
    normalizeMerchant(t.merchant),
    (t.originalAmount ?? 0).toFixed(2),
    t.originalCurrency,
  ].join("|");
}

/** 与现有账本比对，返回 (新交易, 重复数)。ignored 的历史记录也参与去重。 */
export function dedupeAgainst(
  incoming: Transaction[],
  existing: Transaction[],
): { fresh: Transaction[]; duplicates: Transaction[] } {
  const seen = new Set(existing.map((t) => dedupeKeyOf(t)));
  const fresh: Transaction[] = [];
  const duplicates: Transaction[] = [];
  for (const t of incoming) {
    const key = dedupeKeyOf(t);
    if (seen.has(key)) {
      duplicates.push(t);
    } else {
      seen.add(key);
      fresh.push(t);
    }
  }
  return { fresh, duplicates };
}

// ── 6. 文件解析（CSV / XLSX） ─────────────────────────────────────────

export interface ParsedTable {
  headers: string[];
  rows: string[][];
}

/** CSV 解析：支持引号包裹、逗号/分号/制表符分隔、BOM */
export function parseCSV(text: string): ParsedTable {
  const clean = text.replace(/^\uFEFF/, "");
  // 自动嗅探分隔符：取前几行中出现次数最多的候选
  const candidates = [",", ";", "\t"];
  let delimiter = ",";
  let bestCount = -1;
  for (const d of candidates) {
    const count = clean
      .split(/\r?\n/)
      .slice(0, 5)
      .reduce((acc, line) => acc + countTopLevel(line, d), 0);
    if (count > bestCount) {
      bestCount = count;
      delimiter = d;
    }
  }

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < clean.length; i += 1) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else if (ch === "\r") {
      // skip
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const nonEmpty = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (nonEmpty.length === 0) return { headers: [], rows: [] };
  const [headers, ...rest] = nonEmpty;
  return { headers, rows: rest };
}

function countTopLevel(line: string, delimiter: string): number {
  let count = 0;
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === delimiter && !inQuotes) count += 1;
  }
  return count;
}

/**
 * 极简 XLSX 读取器（真实可用，零依赖）：
 * XLSX = ZIP 包。用 DataView 解析 central directory，
 * 用浏览器原生 DecompressionStream("deflate-raw") 解压，
 * 用 DOMParser 解析 sharedStrings.xml 与 sheet1 XML。
 * 不支持公式缓存以外的边缘特性；解析失败时上层提示"导出为 CSV 再导入"。
 */
export async function parseXLSX(buffer: ArrayBuffer): Promise<ParsedTable> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  // ── 找 EOCD（从尾部向前扫） ──
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 66000); i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("not a zip");
  const entryCount = view.getUint16(eocd + 10, true);
  const cdOffset = view.getUint32(eocd + 16, true);

  // ── 解析 central directory ──
  const files = new Map<string, { method: number; size: number; localOffset: number }>();
  let ptr = cdOffset;
  for (let i = 0; i < entryCount; i += 1) {
    if (view.getUint32(ptr, true) !== 0x02014b50) break;
    const method = view.getUint16(ptr + 10, true);
    const size = view.getUint32(ptr + 24, true);
    const nameLen = view.getUint16(ptr + 28, true);
    const extraLen = view.getUint16(ptr + 30, true);
    const commentLen = view.getUint16(ptr + 32, true);
    const localOffset = view.getUint32(ptr + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(ptr + 46, ptr + 46 + nameLen));
    files.set(name, { method, size, localOffset });
    ptr += 46 + nameLen + extraLen + commentLen;
  }

  const inflate = async (raw: Uint8Array): Promise<Uint8Array> => {
    const stream = new Blob([raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer])
      .stream()
      .pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  };

  const readFile = async (name: string): Promise<string> => {
    const entry = files.get(name);
    if (!entry) throw new Error(`missing ${name}`);
    const lv = new DataView(buffer, entry.localOffset, 30);
    if (view.getUint32(entry.localOffset, true) !== 0x04034b50) throw new Error("bad local header");
    const nameLen = lv.getUint16(26, true);
    const extraLen = lv.getUint16(28, true);
    const dataStart = entry.localOffset + 30 + nameLen + extraLen;
    const raw = bytes.subarray(dataStart, dataStart + entry.size);
    const data = entry.method === 0 ? raw : await inflate(raw);
    return new TextDecoder().decode(data);
  };

  // ── sharedStrings ──
  const shared: string[] = [];
  if (files.has("xl/sharedStrings.xml")) {
    const xml = await readFile("xl/sharedStrings.xml");
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    for (const si of Array.from(doc.getElementsByTagName("si"))) {
      const ts = si.getElementsByTagName("t");
      shared.push(Array.from(ts).map((t) => t.textContent ?? "").join(""));
    }
  }

  // ── 第一个 worksheet ──
  const sheetName =
    files.get("xl/worksheets/sheet1.xml") != null
      ? "xl/worksheets/sheet1.xml"
      : [...files.keys()].find((k) => /^xl\/worksheets\/sheet\d+\.xml$/.test(k));
  if (!sheetName) throw new Error("no worksheet");
  const xml = await readFile(sheetName);
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const rows: string[][] = [];
  for (const rowEl of Array.from(doc.getElementsByTagName("row"))) {
    const cells: string[] = [];
    for (const c of Array.from(rowEl.getElementsByTagName("c"))) {
      const ref = c.getAttribute("r") ?? "";
      const colLetters = ref.replace(/\d+$/, "");
      const col = colLetters
        ? colLetters.split("").reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0) - 1
        : cells.length;
      const type = c.getAttribute("t");
      let value = "";
      if (type === "inlineStr") {
        const ts = c.getElementsByTagName("t");
        value = Array.from(ts).map((t) => t.textContent ?? "").join("");
      } else {
        const v = c.getElementsByTagName("v")[0]?.textContent ?? "";
        if (type === "s") value = shared[Number(v)] ?? "";
        else value = v;
      }
      while (cells.length < col) cells.push("");
      cells[col] = value;
    }
    rows.push(cells);
  }
  const nonEmpty = rows.filter((r) => r.some((cell) => cell.trim() !== ""));
  if (nonEmpty.length === 0) return { headers: [], rows: [] };
  const [headers, ...rest] = nonEmpty;
  return { headers, rows: rest };
}

// ── 6b. 字段映射与行 → 交易草稿 ───────────────────────────────────────

export type FieldKey = "date" | "merchant" | "amount" | "currency" | "description";
export type ColumnMapping = Partial<Record<FieldKey, number>>;

const HEADER_HINTS: Array<{ field: FieldKey; patterns: string[] }> = [
  { field: "date", patterns: ["date", "transaction date", "posted", "time", "日期", "时间"] },
  { field: "merchant", patterns: ["merchant", "payee", "vendor", "name", "商户", "对方"] },
  { field: "amount", patterns: ["amount", "value", "金额", "支出", "debit", "charge"] },
  { field: "currency", patterns: ["currency", "ccy", "币种", "币别"] },
  { field: "description", patterns: ["description", "memo", "note", "detail", "remark", "描述", "备注", "摘要"] },
];

/** 表头自动映射；表头缺失（无 header 行）时按位置猜测 date/merchant/amount */
export function autoMapColumns(table: ParsedTable): ColumnMapping {
  const mapping: ColumnMapping = {};
  const headers = table.headers.map((h) => h.trim().toLowerCase());
  for (const { field, patterns } of HEADER_HINTS) {
    const idx = headers.findIndex((h) =>
      patterns.some((p) => h === p || h.includes(p)),
    );
    if (idx >= 0) mapping[field] = idx;
  }
  if (mapping.date == null && table.headers.length >= 1) mapping.date = 0;
  if (mapping.merchant == null && table.headers.length >= 2) mapping.merchant = 1;
  if (mapping.amount == null && table.headers.length >= 3) mapping.amount = 2;
  return mapping;
}

export function parseAmount(raw: string): number | null {
  if (raw == null) return null;
  const cleaned = String(raw).replace(/[฿$€£¥₩₫,\s]/g, "").replace(/(thb|usd|jpy|cny|eur|gbp|sgd|hkd|krw|myr|vnd|aud)/gi, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n === 0) return null;
  return Math.abs(n);
}

/** Excel 序列日期（1900 系统）→ ISO */
function excelSerialToISO(n: number): string | null {
  if (n < 20000 || n > 80000) return null; // ~1954 到 ~2119 之外不当作日期
  const ms = Math.round((n - 25569) * 86400000);
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 宽松日期解析 → ISO "YYYY-MM-DD"；解析失败返回 null */
export function parseDateLoose(raw: string): string | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  // Excel 序列号
  if (/^\d+(\.\d+)?$/.test(s)) return excelSerialToISO(Number(s));
  // ISO / 2026/09/20 / 2026.9.20
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) {
    return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  }
  // Sep 20 / Sep 20, 2026 / 20 Sep 2026
  const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  m = s.match(/^([A-Za-z]{3,})\s+(\d{1,2})(?:,?\s+(\d{4}))?/);
  if (m) {
    const mi = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
    if (mi >= 0) {
      const year = m[3] ?? new Date().getFullYear();
      return `${year}-${String(mi + 1).padStart(2, "0")}-${m[2].padStart(2, "0")}`;
    }
  }
  m = s.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})?/);
  if (m) {
    const mi = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase());
    if (mi >= 0) {
      const year = m[3] ?? new Date().getFullYear();
      return `${year}-${String(mi + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    }
  }
  // 09/20/2026 或 20/09/2026（>12 的必是日）
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    let year = Number(m[3]);
    if (year < 100) year += 2000;
    const day = a > 12 ? a : b > 12 ? b : a; // 歧义时按 DD/MM
    const month = a > 12 ? b : b > 12 ? a : b;
    if (month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  // fallback: Date parse
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return null;
}

/** 币种符号/代码 → code */
export function parseCurrencyLoose(raw: string): string | null {
  const s = String(raw ?? "").trim().toUpperCase();
  if (!s) return null;
  if (CURRENCIES.some((c) => c.code === s)) return s;
  const bySymbol = CURRENCIES.find((c) => s.includes(c.symbol) || s.includes(c.code));
  return bySymbol?.code ?? null;
}

/** 映射后的行 → NewTransaction 草稿（还没建议分类/匹配） */
export interface DraftRow {
  ok: boolean;
  occurredAt: string;
  merchant: string;
  raw: string;
  originalAmount: number;
  originalCurrency: string;
  sourceTransactionId?: string;
}

export function rowsToDrafts(
  table: ParsedTable,
  mapping: ColumnMapping,
): DraftRow[] {
  const get = (row: string[], key: FieldKey): string => {
    const idx = mapping[key];
    return idx == null ? "" : (row[idx] ?? "").trim();
  };
  return table.rows.map((row) => {
    const dateRaw = get(row, "date");
    const merchantRaw = get(row, "description") || get(row, "merchant");
    const amountRaw = get(row, "amount");
    const currencyRaw = get(row, "currency");
    const occurredAt = parseDateLoose(dateRaw) ?? "";
    const amount = parseAmount(amountRaw);
    const currency = parseCurrencyLoose(currencyRaw) ?? "THB";
    return {
      ok: occurredAt !== "" && amount != null && (get(row, "merchant") !== "" || merchantRaw !== ""),
      occurredAt,
      merchant: merchantDisplayName(get(row, "merchant") || merchantRaw || "Unknown"),
      raw: merchantRaw,
      originalAmount: amount ?? 0,
      originalCurrency: currency,
      sourceTransactionId: undefined,
    };
  });
}

/** 草稿 → 完整交易（含建议分类 + Trip 匹配），状态 needs_review */
export function draftsToTransactions(
  drafts: DraftRow[],
  source: TransactionSource,
  trips: Trip[],
  rules: Record<string, MerchantRule>,
): Transaction[] {
  const now = new Date().toISOString();
  return drafts.map((d) => {
    const cat = suggestCategory(d.merchant, d.raw, rules);
    const trip = suggestTrip(d.occurredAt, d.merchant, d.raw, d.originalCurrency, trips);
    return {
      id: localId("txn"),
      source,
      merchant: d.merchant,
      rawMerchant: d.raw !== d.merchant ? d.raw : undefined,
      occurredAt: d.occurredAt,
      originalAmount: d.originalAmount,
      originalCurrency: d.originalCurrency,
      category: cat.category,
      subcategory: cat.subcategory,
      categoryConfidence: cat.confidence,
      tripConfidence: trip?.confidence,
      tripId: trip?.tripId,
      status: "needs_review" as const,
      splitBetween: [],
      createdAt: now,
      updatedAt: now,
    };
  });
}

// ── 7. Split 结算 ────────────────────────────────────────────────────

export interface TravelerBalance {
  id: string;
  name: string;
  paid: number;
  share: number;
  net: number;
}

export interface Transfer {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

export interface Settlement {
  balances: TravelerBalance[];
  transfers: Transfer[];
}

/** 单笔交易里某人的 share（amount/percentage 用固定份额，equal 均摊） */
export function shareFor(t: Transaction, travelerId: string): number {
  const amount = displayAmount(t);
  if (t.splitMode === "amount" || t.splitMode === "percentage") {
    const fixed = t.splitShares?.[travelerId];
    if (fixed != null) return fixed;
  }
  const members = t.splitBetween.length;
  if (members === 0) return 0;
  return amount / members;
}

/**
 * 从交易账本计算某 Trip 的 Split 结算。
 * Actual spending 永远用交易全额（split 只决定谁欠谁，不改 Actual 口径）。
 */
export function settlementForTravelers(
  travelers: Traveler[],
  txns: Transaction[],
): Settlement {
  const balances: TravelerBalance[] = travelers.map((t) => ({
    id: t.id,
    name: t.name,
    paid: 0,
    share: 0,
    net: 0,
  }));
  const byId = new Map(balances.map((b) => [b.id, b]));

  for (const t of txns) {
    if (t.status !== "confirmed") continue;
    const amount = displayAmount(t);
    const payer = t.paidBy ? byId.get(t.paidBy) : undefined;
    if (payer) payer.paid += amount;
    const members = t.splitBetween.filter((id) => byId.has(id));
    if (members.length === 0) continue;
    for (const id of members) {
      byId.get(id)!.share += shareFor(t, id);
    }
  }

  for (const b of balances) b.net = b.paid - b.share;

  const creditors = balances
    .filter((b) => b.net > 0.5)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.net - a.net);
  const debtors = balances
    .filter((b) => b.net < -0.5)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.net - b.net);

  const transfers: Transfer[] = [];
  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci];
    const d = debtors[di];
    const amount = Math.min(c.net, -d.net);
    if (amount > 0.5) {
      transfers.push({
        fromId: d.id,
        fromName: d.name,
        toId: c.id,
        toName: c.name,
        amount: Math.round(amount),
      });
    }
    c.net -= amount;
    d.net += amount;
    if (c.net <= 0.5) ci += 1;
    if (d.net >= -0.5) di += 1;
  }

  return { balances, transfers };
}

// ── 8. 账本聚合 ──────────────────────────────────────────────────────

export interface CurrencyTotal {
  currency: string;
  amount: number;
  count: number;
}

export function totalsByCurrency(txns: Transaction[]): CurrencyTotal[] {
  const map = new Map<string, CurrencyTotal>();
  for (const t of txns) {
    // draft / 未填金额的交易不进 Actual spent
    if (t.status !== "confirmed" || !hasAmount(t)) continue;
    const cur = displayCurrency(t);
    const entry = map.get(cur) ?? { currency: cur, amount: 0, count: 0 };
    entry.amount += displayAmount(t);
    entry.count += 1;
    map.set(cur, entry);
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

/**
 * 某 Trip（或 Unassigned）的可见交易：draft（随手记）也必须可见，
 * 只有 ignored 隐藏。Actual 口径（confirmed-only）由各聚合函数内部过滤。
 */
export function txnsForTrip(txns: Transaction[], tripId?: string): Transaction[] {
  return tripId
    ? txns.filter((t) => t.tripId === tripId && t.status !== "ignored")
    : txns.filter((t) => !t.tripId && t.status !== "ignored");
}

/** Trip 的 Actual spent（按币种分组；headline 取金额最大币种） */
export function tripActualTotals(
  txns: Transaction[],
  tripId?: string,
): CurrencyTotal[] {
  return totalsByCurrency(txnsForTrip(txns, tripId));
}

/** needs_review 队列（含 imported 未处理） */
export function reviewQueue(txns: Transaction[]): Transaction[] {
  return txns.filter(
    (t) => t.status === "needs_review" || t.status === "imported",
  );
}

/** 按分类聚合（display currency） */
export function totalsByCategory(
  txns: Transaction[],
): Array<{ category: ExpenseCategory; amount: number; currency: string; count: number }> {
  const map = new Map<string, { category: ExpenseCategory; amount: number; currency: string; count: number }>();
  for (const t of txns) {
    // 未分类 / 未填金额不进分类统计（以后整理）
    if (t.status !== "confirmed" || !t.category || !hasAmount(t)) continue;
    const cur = displayCurrency(t);
    const key = `${t.category}|${cur}`;
    const entry = map.get(key) ?? {
      category: t.category,
      amount: 0,
      currency: cur,
      count: 0,
    };
    entry.amount += displayAmount(t);
    entry.count += 1;
    map.set(key, entry);
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

// ── 9. 旧数据迁移 ────────────────────────────────────────────────────

/**
 * 旧 Expense → Transaction 迁移（幂等）：
 *   source = manual, status = confirmed，paidBy / splitBetween / tripId / 金额 / 日期 / 分类全保留。
 * 迁移后清空 trip.expenses（此后账本唯一来源是 state.transactions）。
 */
export function migrateWorkspaceState(state: WorkspaceState): WorkspaceState {
  const transactions: Transaction[] = [...(state.transactions ?? [])];
  const merchantRules: Record<string, MerchantRule> = { ...(state.merchantRules ?? {}) };
  let migrated = false;

  // Trip.currency 统一为 ISO 代码（"¥"→CNY）：Transaction 存 ISO，混用会让
  // 预算行 spentInBudgetCurrency 匹配落空（Spent 恒 0）。幂等归一。
  const trips = state.trips.map((trip) => {
    const tripCurrencyCode = codeForSymbol(trip.currency);
    if (tripCurrencyCode !== trip.currency) migrated = true;
    const normalized = { ...trip, currency: tripCurrencyCode };
    if (!trip.expenses || trip.expenses.length === 0) return normalized;
    migrated = true;
    const now = new Date().toISOString();
    for (const e of trip.expenses) {
      transactions.push({
        id: `txn-${e.id}`,
        source: "manual",
        merchant: e.title,
        occurredAt: e.date ?? trip.startDate,
        originalAmount: e.amount,
        originalCurrency: codeForSymbol(trip.currency),
        category: e.category,
        tripId: trip.id,
        status: "confirmed",
        paidBy: e.paidBy,
        splitBetween: e.splitBetween,
        note: e.note,
        createdAt: now,
        updatedAt: now,
      });
    }
    return { ...normalized, expenses: [] };
  });

  if (!migrated && state.transactions && state.merchantRules) return state;
  return { ...state, trips, transactions, merchantRules };
}

// ── 10. Receipt 文件名启发式（诚实方案：无真实 OCR，用户在 Review 确认） ──

/**
 * 从收据文件名提取启发式线索（如 "sukhumvit-thai-kitchen-1280.jpg"）。
 * 不声称做过 OCR：结果一律进入 Review，由用户确认/修正。
 */
export function heuristicFromReceiptFilename(filename: string): {
  merchantGuess: string;
  amountGuess: number | null;
} {
  const base = filename.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");
  const amountMatch = base.match(/(\d+(?:[.,]\d{1,2})?)\s*(thb|usd|jpy|cny|eur|gbp|sgd)?$/i);
  const amountGuess = amountMatch ? parseAmount(amountMatch[1]) : null;
  const merchantPart = amountMatch
    ? base.slice(0, amountMatch.index).trim()
    : base;
  const merchantGuess = merchantPart
    ? merchantDisplayName(merchantPart)
    : "Receipt";
  return { merchantGuess, amountGuess };
}
