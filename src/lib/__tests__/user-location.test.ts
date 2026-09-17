import { describe, expect, it } from "vitest";
import { canonicalTimeZone, tzCoordsFor } from "@/lib/data/tz-coords";
import {
  browserTimeZone,
  cityLabelFromTimeZone,
  distanceKm,
  nearestTimeZoneCity,
  resolveUserLocation,
} from "@/lib/user-location";

describe("cityLabelFromTimeZone — 时区 → 城市级标签", () => {
  it("取时区的城市段（不是地区/国家）", () => {
    expect(cityLabelFromTimeZone("Asia/Shanghai")).toBe("Shanghai");
    expect(cityLabelFromTimeZone("America/New_York")).toBe("New York");
    expect(cityLabelFromTimeZone("America/Argentina/Buenos_Aires")).toBe("Buenos Aires");
    expect(cityLabelFromTimeZone("America/Chicago")).toBe("Chicago");
  });

  it("历史别名先解析到主时区（标签与坐标同城，不出现 1400 km 错配）", () => {
    expect(canonicalTimeZone("Asia/Chongqing")).toBe("Asia/Shanghai");
    expect(cityLabelFromTimeZone("Asia/Chongqing")).toBe("Shanghai");
    expect(cityLabelFromTimeZone("Asia/Calcutta")).toBe("Kolkata");
    expect(cityLabelFromTimeZone("US/Eastern")).toBe("New York");
    expect(cityLabelFromTimeZone("Europe/Kiev")).toBe("Kyiv");
  });

  it("非城市型时区不产生城市名（不硬编造）", () => {
    expect(cityLabelFromTimeZone("UTC")).toBeNull();
    expect(cityLabelFromTimeZone("Etc/GMT-8")).toBeNull();
    expect(cityLabelFromTimeZone("GMT")).toBeNull();
    expect(cityLabelFromTimeZone(null)).toBeNull();
  });
});

describe("tz-coords — 用户所在地数据（独立于 145 目的地数据集）", () => {
  it("常见时区都有参考坐标，包括不在 145 目的地里的城市", () => {
    // Chicago 不是 UTRIPLA 的旅行目的地，但用户所在地必须能取到天气
    expect(tzCoordsFor("America/Chicago")).not.toBeNull();
    expect(tzCoordsFor("Europe/Berlin")).not.toBeNull();
    expect(tzCoordsFor("Africa/Lagos")).not.toBeNull();
    expect(tzCoordsFor("Pacific/Auckland")).not.toBeNull();
    expect(tzCoordsFor("America/Chicago")).toEqual([41.85, -87.65]);
  });

  it("固定偏移时区没有坐标（不是地点，不取天气）", () => {
    expect(tzCoordsFor("Etc/GMT-8")).toBeNull();
    expect(tzCoordsFor("Etc/UTC")).toBeNull();
    expect(tzCoordsFor("Not/AZone")).toBeNull();
    expect(tzCoordsFor(null)).toBeNull();
  });
});

describe("nearestTimeZoneCity — 坐标 → 城市级标签", () => {
  it("给出经纬度即可得到城市级标签（geolocation 路径）", () => {
    expect(nearestTimeZoneCity(41.88, -87.63)?.label).toBe("Chicago");
    expect(nearestTimeZoneCity(31.23, 121.47)?.label).toBe("Shanghai");
  });

  it("远离任何参考城市时返回 null（不硬套远方的城市名）", () => {
    expect(nearestTimeZoneCity(-45.0, -120.0, 200)).toBeNull();
    expect(nearestTimeZoneCity(Number.NaN, 10)).toBeNull();
  });

  it("Haversine 距离量级正确（上海–东京 ≈ 1760 km）", () => {
    const km = distanceKm(31.1443, 121.8083, 35.7647, 140.3864);
    expect(km).toBeGreaterThan(1700);
    expect(km).toBeLessThan(1850);
  });
});

describe("resolveUserLocation — 永不抛异常，且不硬编码任何城市", () => {
  it("返回结构化结果；标签只来自浏览器时区（绝不默认 Tokyo）", async () => {
    const loc = await resolveUserLocation({ allowGeolocation: false });
    expect(loc).toHaveProperty("label");
    expect(loc).toHaveProperty("latitude");
    expect(loc).toHaveProperty("longitude");

    const tz = browserTimeZone();
    expect(loc.timeZone === tz || loc.timeZone === null).toBe(true);
    if (loc.label !== null) {
      expect(loc.label).toBe(cityLabelFromTimeZone(tz));
    }
    // 只有浏览器时区确实属于东京时，才可能存在 Tokyo 标签
    if (loc.label === "Tokyo") {
      expect(tz).toBe("Asia/Tokyo");
    }
  });

  it("allowGeolocation=false 时不触碰 geolocation（不弹权限框）", async () => {
    const loc = await resolveUserLocation({ allowGeolocation: false });
    expect(loc.source === null || loc.source === "timezone").toBe(true);
  });

  it("坐标要么是有限数值，要么为 null（绝不出现 NaN / undefined）", async () => {
    const loc = await resolveUserLocation({ allowGeolocation: false });
    for (const v of [loc.latitude, loc.longitude]) {
      expect(v === null || Number.isFinite(v)).toBe(true);
    }
  });
});
