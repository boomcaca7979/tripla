import type { Itinerary } from "@/types/itinerary";

/**
 * itinerary-input — 一条行程**必要字段**的单一判据。
 *
 * 为什么需要它：分享链接的载荷只经过 `JSON.parse`（见 `lib/share.ts` 的
 * `decodeShareData`），既可能来自旧版本链接，也可能是手工拼出来的 data。
 * 缺 input / 日期，或写下 `departureDate: "soon"` 这类字符串时：
 *
 *   · 展示层会把它交给 `formatDateRange`，渲染出 `Invalid Date — Invalid Date`；
 *   · 保存层会建出一条无目的地的 Trip，或直接抛异常。
 *
 * 因此**展示与保存必须用同一条规则**（`/share` 页面与 `savePageItinerary`），
 * 否则两处会各自漂移：页面放进来、保存才拒绝，用户就看到了一份"能看不能存"的计划。
 *
 * 只校验**必要**字段（目的地 + 出发/返程日期），不做整份 schema 校验：
 * 历史分享链接若缺可选字段（tip / summary / weather / meals 等），仍必须能打开——
 * 这是向后兼容要求，不属于本模块的职责。
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * 是否为 `YYYY-MM-DD` 且真实存在的日历日。
 *
 * 用 UTC 构造 + 回读比较：`new Date("2026-02-31")` 会被宽松地滚到 3 月 3 日，
 * 而按本地时区再 `toISOString()` 又会让东八区的 00:00 退一天。两者都会把
 * 合法日期判错，所以这里既不依赖解析器的宽松行为，也不做时区换算。
 */
export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export type TripInputIssueCode =
  | "MISSING_INPUT"
  | "MISSING_DESTINATION"
  | "MISSING_DATES"
  | "INVALID_DATE";

export interface TripInputIssue {
  /** 稳定 code，供测试与诊断使用（不直接展示给用户）。 */
  code: TripInputIssueCode;
  /** 可读原因，进 console / 失败返回值，不新增任何可见文案。 */
  message: string;
}

/** 缺必要输入统一沿用原保存层的那句话（行为不变，只是收敛到一处）。 */
const MISSING_TRIP_INPUT =
  "Itinerary is missing its trip input (destination or dates).";

/**
 * 校验行程的必要输入。
 *
 * @returns `null` 表示可以展示 / 可以保存；否则给出问题 code 与原因。
 *          调用方一律走**既有**错误态，绝不补默认值让数据看起来有效。
 */
export function tripInputIssue(
  itinerary: Itinerary | null | undefined,
): TripInputIssue | null {
  const input = itinerary?.input as
    | { destination?: { city?: unknown; name?: unknown }; departureDate?: unknown; returnDate?: unknown }
    | undefined;

  if (!input || typeof input !== "object") {
    return { code: "MISSING_INPUT", message: MISSING_TRIP_INPUT };
  }

  const destination = input.destination;
  const city = typeof destination?.city === "string" ? destination.city.trim() : "";
  const name = typeof destination?.name === "string" ? destination.name.trim() : "";
  if (!city && !name) {
    return { code: "MISSING_DESTINATION", message: MISSING_TRIP_INPUT };
  }

  const { departureDate, returnDate } = input;
  if (!departureDate || !returnDate) {
    return { code: "MISSING_DATES", message: MISSING_TRIP_INPUT };
  }

  if (!isValidIsoDate(departureDate) || !isValidIsoDate(returnDate)) {
    return {
      code: "INVALID_DATE",
      message:
        "Itinerary has an invalid travel date (expected a YYYY-MM-DD calendar day).",
    };
  }

  return null;
}

/** 展示层判据：与保存层同源，避免"能看不能存"。 */
export function isDisplayableItinerary(itinerary: Itinerary | null | undefined): boolean {
  return tripInputIssue(itinerary) === null;
}
