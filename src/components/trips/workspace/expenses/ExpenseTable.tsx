"use client";

/**
 * ExpenseTable — Travel Ledger（Capture first → Organize later 的最终形态）。
 *
 * 没有新增表单：底部永久存在一行「Write something...」，
 * 写一句自然语言（"Dinner 850" / "Grab 240 THB" / "Amazing seafood" / "350"）
 * 按 Enter 立即成为一条真实记录，捕获行清空、可连续输入。
 *
 * 金额/币种/时间在记录时解析；分类与 Trip 匹配是记录之后的建议
 * （显示为可点击的 chip，点开即改，绝不弹表单）。
 * 其余单元格 click → inline edit；详情是 Properties popover。
 */

import { useMemo } from "react";
import type { ExpenseCategory, Trip, WorkspaceAction } from "../types";
import type { MerchantRule, Transaction } from "./types";
import {
  EXPENSE_CATEGORY_LABELS,
  money,
  parseQuickCapture,
  suggestCategory,
  suggestTrip,
} from "./engine";
import {
  CaptureLine,
  HoverActions,
  HoverDelete,
  InlineDate,
  InlineNumber,
  InlineSelect,
  InlineText,
} from "../inline";
import { Panel } from "../ui";
import { formatTxnDate } from "./parts";
import { localId } from "../logic";

export function ExpenseTable({
  txns,
  trips,
  dispatch,
  presetTripId,
  defaultCurrency = "CNY",
  rules = {},
  onOpenDetail,
  emptyHint,
}: {
  txns: Transaction[];
  trips: Trip[];
  dispatch: (action: WorkspaceAction) => void;
  /** Trip 内视图：新记录归属的 Trip（全局视图不传 → 自动 Trip 匹配） */
  presetTripId?: string;
  defaultCurrency?: string;
  /** 用户学到的 merchant 规则（记录后的分类建议用） */
  rules?: Record<string, MerchantRule>;
  onOpenDetail: (id: string) => void;
  emptyHint?: string;
}) {
  // 按日期倒序（最新在上）
  const rows = useMemo(
    () => [...txns].filter((t) => t.status !== "ignored").sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
    [txns],
  );

  const patch = (t: Transaction, p: Partial<Transaction>, learn = false) =>
    dispatch({ type: "UPDATE_TXN", id: t.id, patch: p, learn });

  const remove = (t: Transaction) => dispatch({ type: "DELETE_TXN", id: t.id });

  const categoryOptions = (Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((c) => ({
    value: c,
    label: EXPENSE_CATEGORY_LABELS[c],
  }));

  /** 捕获行：写一句 → 解析 → 立即成记录（连续输入不离开账本） */
  const capture = (text: string) => {
    const parsed = parseQuickCapture(text);
    if (!parsed.title && parsed.amount === undefined) return;
    const today = new Date().toISOString().slice(0, 10);
    const occurredAt = today;
    const currency = parsed.currency ?? defaultCurrency;
    // 记录之后的建议（不是门槛）：分类 + Trip matching
    const catSuggestion = parsed.title
      ? suggestCategory(parsed.title, "", rules)
      : undefined;
    const tripSuggestion = presetTripId
      ? undefined
      : suggestTrip(occurredAt, parsed.title, "", currency, trips);
    const now = new Date().toISOString();
    const trip = presetTripId ? trips.find((t) => t.id === presetTripId) : undefined;
    const travelers = trip?.travelers ?? [];
    dispatch({
      type: "ADD_TXN",
      txn: {
        id: localId("txn"),
        source: "manual",
        merchant: parsed.title,
        occurredAt,
        originalAmount: parsed.amount,
        originalCurrency: currency,
        category: catSuggestion ? catSuggestion.category : null,
        subcategory: catSuggestion?.subcategory,
        categoryConfidence: catSuggestion?.confidence,
        tripId: presetTripId ?? tripSuggestion?.tripId,
        tripConfidence: tripSuggestion?.confidence,
        // 标题 + 金额齐了才算真实消费；纯标题 / 纯金额都是 draft（spec #3 vs #5/#6）
        status: parsed.title && parsed.amount !== undefined ? "confirmed" : "draft",
        paidBy: travelers[0]?.id,
        splitBetween: travelers.map((p) => p.id),
        createdAt: now,
        updatedAt: now,
      },
    });
  };

  const showTripCol = !presetTripId && trips.length > 0;
  const cols = showTripCol
    ? "grid-cols-[5.5rem_minmax(0,1.8fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_6rem_5.5rem_minmax(4.5rem,auto)]"
    : "grid-cols-[5.5rem_minmax(0,2fr)_minmax(0,1fr)_6.5rem_5.5rem_minmax(4.5rem,auto)]";

  return (
    <Panel className="divide-y divide-[#eef1f0]">
      {rows.length === 0 && (
        <p className="px-4 pt-3 text-[0.75rem] text-ut-muted">{emptyHint ?? "Start typing below."}</p>
      )}

      {(
        <div className={`grid ${cols} items-center gap-x-2 px-4 pt-3 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ut-muted`}>
          <span>Date</span>
          <span>Item</span>
          <span>Category</span>
          {showTripCol && <span>Trip</span>}
          <span className="text-right">Amount</span>
          <span>Paid by</span>
          <span aria-hidden="true" />
        </div>
      )}

      {rows.map((t) => {
        const trip = trips.find((tr) => tr.id === t.tripId);
        const travelers = trip?.travelers ?? [];
        const paidByOptions = [
          ...travelers.map((p) => ({ value: p.id, label: p.name })),
          { value: "", label: "—" },
        ];
        const paidByLabel = travelers.find((p) => p.id === t.paidBy)?.name;
        return (
          <div key={t.id} className={`group grid ${cols} items-center gap-x-2 px-4 py-1`}>
            <InlineDate
              value={t.occurredAt}
              display={formatTxnDate(t.occurredAt)}
              onCommit={(date) => date && patch(t, { occurredAt: date })}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <InlineText
                  value={t.merchant}
                  className="min-w-0 flex-1 truncate text-[0.875rem] font-medium text-ut-ink"
                  placeholder="Untitled"
                  muted={!t.merchant}
                  onCommit={(merchant) => merchant && patch(t, { merchant })}
                />
                {t.status === "draft" && (
                  <span className="shrink-0 rounded-full bg-[#fdf3e3] px-2 py-0.5 text-[0.625rem] font-semibold text-[#8a5a12]">
                    Draft
                  </span>
                )}
              </div>
            </div>
            <InlineSelect
              value={t.category ?? ""}
              options={[{ value: "", label: "—" }, ...categoryOptions]}
              render={(v) =>
                v === "" ? (
                  <span className="text-[0.8125rem] text-[#9aa5a8]">—</span>
                ) : (
                  <span className="inline-block max-w-full truncate rounded-md bg-[#f2f5f4] px-1.5 py-0.5 text-[0.6875rem] font-medium text-ut-text-2">
                    {EXPENSE_CATEGORY_LABELS[v]}
                    {/* 置信度只在未确认的建议行显示（Review 语义）；confirmed 行是干净属性 */}
                    {t.status !== "confirmed" && t.categoryConfidence != null && t.categoryConfidence >= 0.9
                      ? ` · ${Math.round(t.categoryConfidence * 100)}%`
                      : ""}
                  </span>
                )
              }
              onCommit={(category) =>
                patch(t, { category: (category || null) as ExpenseCategory | null }, category !== "")
              }
            />
            {showTripCol && (
              <InlineSelect
                value={t.tripId ?? ""}
                options={[{ value: "", label: "Unassigned" }, ...trips.map((tr) => ({ value: tr.id, label: tr.destination }))]}
                render={() => (
                  <span className="block truncate text-[0.8125rem] text-ut-text-2">
                    {trip ? trip.destination : "Unassigned"}
                    {!t.tripId && t.tripConfidence == null && ""}
                  </span>
                )}
                onCommit={(tripId) => patch(t, { tripId: tripId || undefined, tripConfidence: undefined })}
              />
            )}
            <div className="text-right">
              <InlineNumber
                value={t.originalAmount ?? 0}
                display={t.originalAmount != null ? money(t.originalAmount, t.originalCurrency) : "—"}
                onCommit={(originalAmount) =>
                  patch(t, { originalAmount: originalAmount > 0 ? originalAmount : undefined })
                }
              />
            </div>
            <div className="min-w-0">
              {travelers.length > 0 ? (
                <InlineSelect
                  value={t.paidBy ?? ""}
                  options={paidByOptions}
                  render={() => (
                    <span className="block truncate text-[0.8125rem] text-ut-text-2">{paidByLabel ?? "—"}</span>
                  )}
                  onCommit={(paidBy) => patch(t, { paidBy: paidBy || undefined })}
                />
              ) : (
                <span className="block truncate text-[0.8125rem] text-[#9aa5a8]">{paidByLabel ?? "—"}</span>
              )}
            </div>
            <HoverActions>
              <button
                type="button"
                className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#8a969a] transition-colors hover:text-ut-ink"
                onClick={() => onOpenDetail(t.id)}
              >
                Edit
              </button>
              <HoverDelete label={t.merchant || "this record"} onConfirm={() => remove(t)} />
            </HoverActions>
          </div>
        );
      })}

      {/* 永久捕获行（不是表单）：写一句 → Enter → 立即成为一条记录 */}
      <CaptureLine
        placeholder="Write something...  e.g. Dinner 850"
        onSubmit={capture}
      />
    </Panel>
  );
}
