"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TripsWorkspace from "@/components/trips/workspace/TripsWorkspace";
import type { TravelInterest } from "@/types/itinerary";

/**
 * TripsNewHandoff — /trips/new 的客户端承接（读取 URL query 并预填工作台）。
 *
 * query 洁净化：
 *   · destination = UTRIPLA 目的地 slug；缺失/无效 → 非法值丢弃（正常空选择态，不伪造目的地）
 *   · startDate/endDate = ISO 日期；end < start 或格式非法 → 不预填该日期
 *   · 其余首页表单字段（originCity/travelStyle/budgetLevel/interests/travelers）
 *     全部读入 prefill.preferences，随 CREATE_TRIP 落 Trip.preferences —— 不静默丢失。
 *   · trip = 公开行程 slug（「Plan this trip」深链透传）：命中真实种子行程时，
 *     把它的天数/主题/活动映射为 prefill.sourceDays，创建行程时经既有
 *     IMPORT_SOURCE_DAYS reducer 导入 routeDays/stops —— 源数据没有的
 *     日期/价格/时长一律不造。slug 无效 → 静默忽略（正常空行程创建）。
 * 创建走现有 workspace reducer / 持久化流程（不新增第二套存储）。
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const VALID_INTERESTS: readonly TravelInterest[] = [
  "museums",
  "nature",
  "food",
  "shopping",
  "nightlife",
  "history",
  "sports",
  "beaches",
];

/** 源行程经洁净化后的可导入内容（仅名称/时间/主题 —— 源数据就是这么多）。 */
export interface SourceDayContent {
  theme: string;
  stops: Array<{ name: string; time: string }>;
}

export interface HandoffPrefill {
  destinationId?: string;
  destinationLabel?: string;
  startDate?: string;
  endDate?: string;
  preferences?: {
    originCity?: string;
    travelStyle?: string;
    budgetLevel?: string;
    interests?: string[];
    travelers?: number;
  };
  sourceDays?: SourceDayContent[];
}

export default function TripsNewHandoff() {
  const params = useSearchParams();

  const destinationId = params.get("destination") ?? undefined;
  const destinationCity = params.get("destinationCity") ?? undefined;
  const destinationCountry = params.get("destinationCountry") ?? undefined;
  const rawStart = params.get("startDate");
  const rawEnd = params.get("endDate");
  const originCity = params.get("originCity") ?? undefined;
  const travelStyle = params.get("travelStyle") ?? undefined;
  const budgetLevel = params.get("budgetLevel") ?? undefined;
  const travelersRaw = Number(params.get("travelers"));
  const interests = (params.get("interests") ?? "")
    .split(",")
    .map((i) => i.trim())
    .filter((i): i is TravelInterest => VALID_INTERESTS.includes(i as TravelInterest));
  const tripSlug = params.get("trip") ?? undefined;

  const startDate = rawStart && ISO_DATE.test(rawStart) ? rawStart : undefined;
  const endDate = rawEnd && ISO_DATE.test(rawEnd) ? rawEnd : undefined;
  const validRange =
    startDate && endDate && endDate >= startDate
      ? { startDate, endDate }
      : { startDate, endDate: undefined };

  const preferences = {
    originCity: originCity || undefined,
    travelStyle: travelStyle || undefined,
    budgetLevel: budgetLevel || undefined,
    interests: interests.length > 0 ? interests : undefined,
    travelers:
      Number.isFinite(travelersRaw) && travelersRaw >= 1 && travelersRaw <= 20
        ? Math.floor(travelersRaw)
        : undefined,
  };
  const hasPreferences = Object.values(preferences).some((v) => v !== undefined);

  // 源行程内容按需加载：280 个种子行程数据体量大，只在深链真正携带 slug
  // 时才拉取对应数据（动态 import 走独立 chunk）。异步 setState 在 promise
  // 回调内，不在 effect 体内同步执行。
  const [sourceDays, setSourceDays] = useState<SourceDayContent[] | undefined>(undefined);
  useEffect(() => {
    if (!tripSlug) return;
    let alive = true;
    import("@/data/trips")
      .then(({ getTripBySlug }) => {
        if (!alive) return;
        const trip = getTripBySlug(tripSlug);
        if (!trip || trip.itinerary.length === 0) return;
        setSourceDays(
          trip.itinerary.map((day) => ({
            theme: day.theme,
            stops: day.activities.map((a) => ({ name: a.name, time: a.time })),
          })),
        );
      })
      .catch(() => {
        // 加载失败 → 正常空行程创建，不阻塞主流程
      });
    return () => {
      alive = false;
    };
  }, [tripSlug]);

  const prefill: HandoffPrefill | null =
    destinationId || destinationCity || hasPreferences || sourceDays
      ? {
          destinationId,
          destinationLabel: destinationCity
            ? destinationCountry
              ? `${destinationCity}, ${destinationCountry}`
              : destinationCity
            : undefined,
          startDate: validRange.startDate,
          endDate: validRange.endDate,
          preferences: hasPreferences ? preferences : undefined,
          sourceDays,
        }
      : null;

  return <TripsWorkspace prefill={prefill} />;
}
