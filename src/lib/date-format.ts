/**
 * date-format — 站点的**唯一英文日期/时间格式化入口**。
 *
 * 为什么要集中在这里：任何 `Intl.DateTimeFormat` / `toLocaleDateString` /
 * `toLocaleString` **不显式传 locale** 时，格式化结果取决于浏览器/系统 locale；
 * 在 zh-CN 浏览器上就会出现 "2026年9月14日" 这类中文单位。首页必须始终英文。
 *
 * 约定：
 *   · 全站英文界面一律使用 EN_LOCALE（en-US），显式传入，绝不依赖默认 locale。
 *   · 需要"按某个地区习惯"的展示（如详情页的时间段）也应显式传入 locale。
 */

export const EN_LOCALE = "en-US";

/** ISO 日期（YYYY-MM-DD）或 Date → "Sep 14, 2026"；无法解析 → 原样返回空串。 */
export function formatDateEn(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(EN_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** ISO 日期 → "September"（完整月份名，英文）。 */
export function formatMonthEn(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(EN_LOCALE, { month: "long" }).format(date);
}

/** ISO 日期 → "Sep"（短月份名，英文）。 */
export function formatMonthShortEn(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(EN_LOCALE, { month: "short" }).format(date);
}

/** ISO 日期 → "Mon"（短星期名，英文）。 */
export function formatWeekdayShortEn(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(EN_LOCALE, { weekday: "short" }).format(date);
}

// ── 静态英文名称表（日历网格用；完全不依赖任何 locale / Intl） ──────────
// 说明：即使是显式传 locale 的 Intl，也不如静态表可控（不同引擎/版本的
// CLDR 数据版本会有差异）。日历 UI 的月份与星期一律用下面这两张表。

export const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** 星期短名，索引与 Date.getDay() 一致（0 = Sunday）。 */
export const WEEKDAY_SHORT_EN = [
  "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
] as const;

/** 日历表头顺序（周日开头，en-US 习惯）。 */
export const WEEKDAY_ORDER_EN = [0, 1, 2, 3, 4, 5, 6] as const;

/** "September 2026"（日历标题）。 */
export function formatMonthYearEn(year: number, monthIndex: number): string {
  const m = MONTH_NAMES_EN[((monthIndex % 12) + 12) % 12];
  return `${m} ${year}`;
}

/** ISO 日期 → "September 14, 2026"（完整英文日期，用于 aria-label / 提示）。 */
export function formatFullDateEn(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "";
  return `${MONTH_NAMES_EN[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Date → ISO（YYYY-MM-DD，本地日历日，不做 UTC 转换）。 */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** ISO → Date（本地日历日）；非法输入返回 null。 */
export function fromIsoDate(value: string | null | undefined): Date | null {
  return toDate(value);
}

/**
 * 安全的字符串 → Date：
 * · "YYYY-MM-DD" 按**本地日历日**解析（避免 new Date("2026-09-14") 被当成 UTC
 *   而在西半球时区显示成 9月13日）。
 * · 无法解析返回 null。
 */
function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const isoDay = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (isoDay) {
    const [, y, m, d] = isoDay;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
