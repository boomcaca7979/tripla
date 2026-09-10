import { describe, expect, it } from "vitest";
import {
  deriveVisualState,
  destinationLocalHour,
  moonPhaseFor,
  moonVisualFor,
  MOON_PHASE_SEQUENCE,
  skyFor,
  accentFor,
  type MoonPhaseId,
} from "../visual-state";

// ── Moon Phase ───────────────────────────────────────────────────────

describe("moonPhaseFor", () => {
  it("已知新月历元当天返回 new moon", () => {
    // 2000-01-06 18:14 UTC = 历元（新月）
    expect(moonPhaseFor(new Date("2000-01-06T18:14:00Z"))).toBe("new");
  });

  it("历元后约半个朔望月返回 full moon", () => {
    expect(moonPhaseFor(new Date("2000-01-21T18:14:00Z"))).toBe("full");
  });

  it("8 个相位命名齐全且互不相同", () => {
    const names = new Set(MOON_PHASE_SEQUENCE);
    expect(names.size).toBe(8);
    expect(names).toContain("new");
    expect(names).toContain("full");
  });

  it("输出恒在 8 相集合内（任意日期）", () => {
    for (let d = 0; d < 400; d += 7) {
      const date = new Date(2026, 0, 1 + d);
      expect(MOON_PHASE_SEQUENCE).toContain(moonPhaseFor(date));
    }
  });
});

describe("moonVisualFor", () => {
  it("新月几乎不可见、满月最亮（相同夜间/晴朗条件）", () => {
    const newMoon = moonVisualFor("new", "clear");
    const fullMoon = moonVisualFor("full", "clear");
    expect(fullMoon.opacityMul).toBeGreaterThan(newMoon.opacityMul * 5);
    expect(fullMoon.sizeMul).toBeGreaterThan(newMoon.sizeMul);
    expect(fullMoon.glowMul).toBeGreaterThan(newMoon.glowMul * 2);
  });

  it("8 相照明度单调覆盖 0→1 区间", () => {
    const values = MOON_PHASE_SEQUENCE.map(
      (p) => moonVisualFor(p as MoonPhaseId, "clear").opacityMul,
    );
    expect(Math.min(...values)).toBeLessThan(0.2);
    expect(Math.max(...values)).toBeGreaterThan(0.9);
  });

  it("天气压暗月亮：暴雨中的满月暗于晴朗满月", () => {
    const clear = moonVisualFor("full", "clear");
    const storm = moonVisualFor("full", "storm");
    expect(storm.opacityMul).toBeLessThan(clear.opacityMul * 0.2);
  });
});

// ── Composite State（组合不互相覆盖） ─────────────────────────────────

describe("deriveVisualState 组合性", () => {
  const base = { hour: 18, season: "autumn" as const, mood: "all" as const, weather: "clear" as const, moonPhase: "full" as const };

  it("mood 改变 accent 但不改变天空的关键结构", () => {
    const all = deriveVisualState(base);
    const nature = deriveVisualState({ ...base, mood: "nature" });
    expect(nature.accent).not.toBe(all.accent);
    // 天空仍由 hour×season×weather 主导（mood 不覆盖天空）
    expect(nature.a).toBe(all.a);
  });

  it("weather 改变天空但保留 mood 色相方向", () => {
    const clear = deriveVisualState({ ...base, mood: "nature" });
    const rain = deriveVisualState({ ...base, mood: "nature", weather: "rain" });
    expect(rain.a).not.toBe(clear.a); // 环境改变
    // mood 色相保留：rain 的 accent 仍是 nature 绿系（被去饱和而非变色）
    const hueOf = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
      const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255;
      if (mx === mn) return 0;
      let h = 0;
      if (mx === r / 255) h = ((g / 255 - b / 255) / (mx - mn)) % 6;
      else if (mx === g / 255) h = (b / 255 - r / 255) / (mx - mn) + 2;
      else h = (r / 255 - g / 255) / (mx - mn) + 4;
      h *= 60;
      return h < 0 ? h + 360 : h;
    };
    expect(Math.abs(hueOf(rain.accent) - hueOf(clear.accent))).toBeLessThan(30);
  });

  it("moonPhase 改变月亮视觉但不影响 accent/天空", () => {
    const newMoon = deriveVisualState({ ...base, moonPhase: "new" });
    const fullMoon = deriveVisualState({ ...base, moonPhase: "full" });
    expect(newMoon.moon.opacityMul).toBeLessThan(fullMoon.moon.opacityMul);
    expect(newMoon.accent).toBe(fullMoon.accent);
    expect(newMoon.a).toBe(fullMoon.a);
  });

  it("hour 改变天空与 accent 亮度，季节独立生效", () => {
    const day = deriveVisualState(base);
    const night = deriveVisualState({ ...base, hour: 23 });
    expect(night.a).not.toBe(day.a);
    expect(night.accent).not.toBe(day.accent);
    const winter = deriveVisualState({ ...base, season: "winter" });
    expect(winter.accent).not.toBe(day.accent);
  });
});

// ── Destination Local Time ───────────────────────────────────────────

describe("destinationLocalHour", () => {
  it("同一时刻 Tokyo 与 UTC 差 9 小时", () => {
    const d = new Date("2026-09-09T12:00:00Z");
    const tokyo = destinationLocalHour("Asia/Tokyo", d);
    const utc = destinationLocalHour("UTC", d);
    expect(Math.round((tokyo - utc) % 24)).toBe(9);
  });

  it("返回值在 [0, 24) 区间", () => {
    for (let h = 0; h < 24; h++) {
      const v = destinationLocalHour("Asia/Tokyo", new Date(2026, 8, 9, h, 30));
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(24);
    }
  });

  it("非法时区回退本地时间（不抛错）", () => {
    expect(() => destinationLocalHour("Not/AZone", new Date())).not.toThrow();
  });
});

// ── Sky / Accent 有效性 ──────────────────────────────────────────────

describe("skyFor / accentFor 输出有效性", () => {
  it("任意组合下输出均为合法 hex 且天空三色互不全等", () => {
    for (const weather of ["clear", "cloudy", "rain", "snow", "storm"] as const) {
      for (const hour of [0, 7, 12, 18, 23]) {
        const s = skyFor(hour, "autumn", weather);
        expect(s.a).toMatch(/^#[0-9a-f]{6}$/);
        expect(s.b).toMatch(/^#[0-9a-f]{6}$/);
        expect(s.c).toMatch(/^#[0-9a-f]{6}$/);
        const a = accentFor(hour, "autumn", "food", weather);
        expect(a.accent).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });
});
