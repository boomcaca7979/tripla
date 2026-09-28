"use client";

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

  const prefill: HandoffPrefill | null =
    destinationId || destinationCity || hasPreferences
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
        }
      : null;

  return <TripsWorkspace prefill={prefill} />;
}
