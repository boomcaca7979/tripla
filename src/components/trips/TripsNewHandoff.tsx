"use client";

import { useSearchParams } from "next/navigation";
import TripsWorkspace from "@/components/trips/workspace/TripsWorkspace";

/**
 * TripsNewHandoff — /trips/new 的客户端承接（读取 URL query 并预填工作台）。
 *
 * query 洁净化：
 *   · destination = UTRIPLA 目的地 slug；缺失/无效 → prefill 为 null（正常空选择态，不伪造目的地）
 *   · startDate/endDate = ISO 日期；end < start 或格式非法 → 不预填该日期
 * 创建走现有 workspace reducer / 持久化流程（不新增第二套存储）。
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default function TripsNewHandoff() {
  const params = useSearchParams();

  const destinationId = params.get("destination");
  const rawStart = params.get("startDate");
  const rawEnd = params.get("endDate");

  const startDate = rawStart && ISO_DATE.test(rawStart) ? rawStart : undefined;
  const endDate = rawEnd && ISO_DATE.test(rawEnd) ? rawEnd : undefined;
  const validRange =
    startDate && endDate && endDate >= startDate
      ? { startDate, endDate }
      : { startDate, endDate: undefined };

  const prefill = destinationId
    ? {
        destinationId,
        startDate: validRange.startDate,
        endDate: validRange.endDate,
      }
    : null;

  return <TripsWorkspace prefill={prefill} />;
}
