"use client";

import { useState } from "react";
import { useTravelStore } from "@/store/travel";
import { resolvePageMode, savePageItinerary } from "@/lib/travel-workspace";
import type { Itinerary } from "@/types/itinerary";

interface ItineraryBuilderProps {
  itinerary: Itinerary;
}

export default function ItineraryBuilder({ itinerary }: ItineraryBuilderProps) {
  const saveItinerary = useTravelStore((s) => s.saveItinerary);
  const savedItineraries = useTravelStore((s) => s.savedItineraries);
  const alreadySaved = savedItineraries.some((it) => it.id === itinerary.id);
  const [saved, setSaved] = useState(alreadySaved);
  const [pending, setPending] = useState(false);

  const handleSave = async () => {
    if (saved || pending) return;
    setPending(true);
    try {
      // 在点击那一刻解析身份 → mode（guest=localStorage / 登录=Supabase）。
      // resolvePageMode() 返回 null 表示会话尚未解析：拒绝写入，也绝不把按钮
      // 置成成功态（「不假成功」纪律，与 travel-workspace 适配层一致）。
      const mode = await resolvePageMode();
      if (!mode) return;
      const result = await savePageItinerary(mode, itinerary);
      if (!result.ok) {
        // 真实写入失败（配额 / 隐私模式 / 网络 / RLS）：按钮保持可重试的
        // "Save Itinerary" 状态，不显示 Saved ✓。诊断信息进 console。
        console.error("[ItineraryBuilder] Save failed:", result);
        return;
      }
      // 成功后才落既有 savedItineraries 标记（防止同一浏览器重复保存出
      // 重复 Trip），并把按钮置成既有的 Saved ✓ 成功态。
      saveItinerary(itinerary);
      setSaved(true);
    } catch (error) {
      // 兜底：未预期异常（如损坏的分享载荷）不得变成"点了没反应"的静默失败，
      // 也绝不置成功态。按钮保持可重试，诊断信息进 console。
      console.error("[ItineraryBuilder] Save threw:", error);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={saved}
      className={[
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        saved
          ? "cursor-not-allowed bg-green-100 text-green-700"
          : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      ].join(" ")}
    >
      {saved ? "Saved ✓" : "Save Itinerary"}
    </button>
  );
}
