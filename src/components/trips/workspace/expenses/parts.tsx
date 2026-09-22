"use client";

/**
 * expenses/parts — Expenses 共享视觉原语（Global Expenses 与 Trip Expenses 复用）。
 * 视觉沿用 workspace/ui 的 Stippl 语言：白卡 / 胶囊按钮 / mint active。
 */

import type { Transaction, TransactionStatus, TransactionSource } from "./types";
import type { ExpenseCategory, Trip } from "../types";
import {
  EXPENSE_CATEGORY_LABELS,
  SUBCATEGORY_OPTIONS,
  displayAmount,
  displayCurrency,
  money,
  settlementForTravelers,
  totalsByCurrency,
} from "./engine";
import { PANEL_SOFT } from "../ui";

// ── 日期标签 ─────────────────────────────────────────────────────────

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Sep 20" / 跨年时 "Dec 28, 2026" */
export function formatTxnDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const yearTag = y === new Date().getFullYear() ? "" : `, ${y}`;
  return `${MONTHS_SHORT[m - 1]} ${d}${yearTag}`;
}

/** 按日期分组（倒序），日期未知排最后 */
export function groupByDate(txns: Transaction[]): Array<{ date: string; txns: Transaction[] }> {
  const map = new Map<string, Transaction[]>();
  for (const t of txns) {
    const key = t.occurredAt || "—";
    const list = map.get(key) ?? [];
    list.push(t);
    map.set(key, list);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))
    .map(([date, list]) => ({ date, txns: list }));
}

// ── 小标签 ───────────────────────────────────────────────────────────

export function ConfidenceBadge({ confidence }: { confidence?: number }) {
  if (confidence == null || confidence <= 0) return null;
  const pct = Math.round(confidence * 100);
  const low = confidence < 0.7;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold tabular-nums ${
        low ? "bg-[#fdf3e3] text-[#8a5a12]" : "bg-[#e0f3ea] text-[#0b6b47]"
      }`}
    >
      {pct}%
    </span>
  );
}

export function StatusChip({ status }: { status: TransactionStatus }) {
  const label: Record<TransactionStatus, string> = {
    draft: "Draft",
    imported: "Imported",
    needs_review: "Needs review",
    confirmed: "Confirmed",
    ignored: "Ignored",
  };
  const style =
    status === "confirmed"
      ? "bg-[#e0f3ea] text-[#0b6b47]"
      : status === "ignored"
        ? "bg-[#f0f2f1] text-[#8a969a]"
        : "bg-[#fdf3e3] text-[#8a5a12]";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${style}`}>
      {label[status]}
    </span>
  );
}

export const SOURCE_LABEL: Record<TransactionSource, string> = {
  manual: "Manual",
  csv: "CSV",
  xlsx: "Excel",
  receipt: "Receipt",
  connected_account: "Connected",
};

export function CategoryLine({ txn }: { txn: Transaction }) {
  return (
    <span>
      {txn.category ? EXPENSE_CATEGORY_LABELS[txn.category] : "—"}
      {txn.subcategory ? ` · ${txn.subcategory}` : ""}
    </span>
  );
}

// ── 交易行 ───────────────────────────────────────────────────────────

export function TransactionRow({
  txn,
  trips,
  onClick,
  showStatus = false,
}: {
  txn: Transaction;
  trips: Trip[];
  onClick: () => void;
  showStatus?: boolean;
}) {
  const trip = txn.tripId ? trips.find((t) => t.id === txn.tripId) : undefined;
  const lowConfidence = txn.status !== "confirmed" && (txn.categoryConfidence ?? 0) < 0.7;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 text-left transition-colors hover:bg-[#f6f8f7]"
    >
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
          <span className="truncate text-[0.9375rem] font-semibold text-ut-ink">{txn.merchant}</span>
          {showStatus && <StatusChip status={txn.status} />}
          {lowConfidence && (
            <span className="rounded-full bg-[#fdf3e3] px-2 py-0.5 text-[0.6875rem] font-semibold text-[#8a5a12]">
              Needs confirmation
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-[0.8125rem] text-ut-muted">
          <CategoryLine txn={txn} />
          {trip && ` · ${trip.destination}`}
          {!trip && ` · Unassigned`}
          {txn.source !== "manual" && ` · ${SOURCE_LABEL[txn.source]}`}
        </span>
      </span>
      <span className="text-[0.9375rem] font-semibold tabular-nums text-ut-text">
        {money(displayAmount(txn), displayCurrency(txn))}
      </span>
    </button>
  );
}

// ── Review 卡 ────────────────────────────────────────────────────────

export function ReviewCard({
  txn,
  trips,
  selected,
  onToggle,
  onConfirm,
  onEdit,
  onIgnore,
}: {
  txn: Transaction;
  trips: Trip[];
  selected: boolean;
  onToggle: () => void;
  onConfirm: () => void;
  onEdit: () => void;
  onIgnore: () => void;
}) {
  const trip = txn.tripId ? trips.find((t) => t.id === txn.tripId) : undefined;
  const lowConfidence = (txn.categoryConfidence ?? 0) < 0.7 || (txn.tripConfidence ?? 1) < 0.5;
  return (
    <div className={`rounded-2xl border bg-white p-5 ${selected ? "border-ut-accent" : "border-[#e8ecec]"}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Select ${txn.merchant}`}
          className="mt-1 h-4 w-4 cursor-pointer accent-[#0aa56c]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-[1rem] font-bold tracking-[-0.01em] text-ut-ink">{txn.merchant}</p>
            <p className="text-[1rem] font-semibold tabular-nums text-ut-text">
              {money(displayAmount(txn), displayCurrency(txn))}
            </p>
          </div>
          <p className={`mt-1 text-[0.8125rem] text-ut-muted`}>
            <CategoryLine txn={txn} />
            {` · `}
            {trip ? trip.destination : "Unassigned"}
            {trip && txn.tripConfidence != null && tripConfidencePct(txn.tripConfidence) !== null && (
              <span className="ml-1 font-semibold text-[#0b6b47]">
                · {tripConfidencePct(txn.tripConfidence)}%
              </span>
            )}
            {` · ${formatTxnDate(txn.occurredAt)} · ${SOURCE_LABEL[txn.source]}`}
          </p>
          {txn.rawMerchant && txn.rawMerchant !== txn.merchant && (
            <p className={`mt-1 truncate text-[0.6875rem] text-[#8a969a]`}>Original: {txn.rawMerchant}</p>
          )}
          {lowConfidence && (
            <p className="mt-2 inline-block rounded-full bg-[#fdf3e3] px-2.5 py-1 text-[0.6875rem] font-semibold text-[#8a5a12]">
              Needs confirmation — low-confidence suggestion
            </p>
          )}
          {txn.receiptUrl && txn.receiptUrl.startsWith("data:image") && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={txn.receiptUrl}
              alt={`Receipt for ${txn.merchant}`}
              className="mt-3 max-h-40 rounded-xl border border-[#eef1f0] object-contain"
            />
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex h-9 cursor-pointer items-center rounded-full bg-ut-accent px-4 text-[0.75rem] font-semibold text-white transition-colors hover:bg-ut-accent-strong"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 cursor-pointer items-center rounded-full border border-[#dfe5e4] bg-white px-4 text-[0.75rem] font-semibold text-ut-text transition-colors hover:border-[#c6d0ce]"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onIgnore}
          className="inline-flex h-9 cursor-pointer items-center rounded-full border border-[#dfe5e4] bg-white px-4 text-[0.75rem] font-semibold text-[#8a969a] transition-colors hover:border-[#e6b9b6] hover:text-[#c4453d]"
        >
          Ignore
        </button>
      </div>
    </div>
  );
}

function tripConfidencePct(confidence: number): number | null {
  if (confidence <= 0) return null;
  return Math.round(confidence * 100);
}

// ── Settlement 卡（Trip People / Global Split 复用） ──────────────────

export function SettlementCard({
  trip,
  txns,
}: {
  trip: Trip;
  txns: Transaction[];
}) {
  const settlement = settlementForTravelers(trip.travelers, txns);
  if (trip.travelers.length === 0) return null;
  // 结算显示币种：跟随该 Trip 交易的主币种（原始币种保留，不伪造汇率换算）
  const currency = totalsByCurrency(txns)[0]?.currency ?? trip.currency;
  return (
    <div className="rounded-2xl border border-[#e8ecec] bg-white">
      {/* 每人 Paid / Share / Balance */}
      <div className="divide-y divide-[#eef1f0]">
        {settlement.balances.map((b) => (
          <div key={b.id} className="flex items-baseline gap-x-4 gap-y-1 px-5 py-3.5">
            <p className="min-w-0 flex-1 text-[0.9375rem] font-semibold text-ut-ink">{b.name}</p>
            <p className="text-[0.8125rem] tabular-nums text-ut-muted">
              Paid <span className="font-medium text-ut-text-2">{money(b.paid, currency)}</span>
            </p>
            <p className="text-[0.8125rem] tabular-nums text-ut-muted">
              Share <span className="font-medium text-ut-text-2">{money(b.share, currency)}</span>
            </p>
            <p
              className={`w-24 text-right text-[0.8125rem] font-semibold tabular-nums ${
                Math.abs(b.net) <= 0.5 ? "text-ut-muted" : b.net > 0 ? "text-[#0b6b47]" : "text-[#c4453d]"
              }`}
            >
              {Math.abs(b.net) <= 0.5 ? "Settled" : b.net > 0 ? `+${money(b.net, currency)}` : money(b.net, currency)}
            </p>
          </div>
        ))}
      </div>
      {/* 转账 */}
      <div className="border-t border-[#eef1f0] px-5 py-4">
        <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ut-muted">
          Settle up
        </p>
        {settlement.transfers.length === 0 ? (
          <p className="text-[0.875rem] text-ut-text-2">
            {txns.length === 0
              ? "Record expenses first — balances appear as soon as anything is split."
              : "Settled — nobody owes anybody."}
          </p>
        ) : (
          <ul className="space-y-2.5">
            {settlement.transfers.map((t, i) => (
              <li key={`${t.fromId}-${t.toId}-${i}`} className="flex items-baseline gap-3">
                <span className="text-[0.9375rem] text-ut-text">{t.fromName}</span>
                <span aria-hidden="true" className="text-ut-accent">→</span>
                <span className="text-[0.9375rem] text-ut-text">{t.toName}</span>
                <span className="ml-auto text-[0.9375rem] font-semibold tabular-nums text-ut-accent">
                  {money(t.amount, currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── 分类选择（一级 + 二级） ──────────────────────────────────────────

/**
 * CategorySelect — 一级可空（null = 未分类，以后整理），二级自由文本：
 * 建议项经 datalist 提供（Street food / Thai BBQ 等自定义值必须允许），绝不强制。
 */
export function CategorySelect({
  category,
  subcategory,
  onCategory,
  onSubcategory,
}: {
  category: ExpenseCategory | null;
  subcategory?: string;
  onCategory: (c: ExpenseCategory | null) => void;
  onSubcategory: (s: string | undefined) => void;
}) {
  const subs = category ? SUBCATEGORY_OPTIONS[category] : [];
  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        value={category ?? ""}
        onChange={(e) => {
          onCategory((e.target.value || null) as ExpenseCategory | null);
          onSubcategory(undefined);
        }}
        aria-label="Category"
        className="h-10 w-full cursor-pointer rounded-xl border border-[#dfe5e4] bg-white px-2.5 text-[0.8125rem] text-ut-text focus:border-ut-accent focus:outline-none"
      >
        <option value="">—</option>
        {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((c) => (
          <option key={c} value={c}>
            {EXPENSE_CATEGORY_LABELS[c]}
          </option>
        ))}
      </select>
      <input
        list="subcategory-suggestions"
        value={subcategory ?? ""}
        onChange={(e) => onSubcategory(e.target.value.trim() || undefined)}
        placeholder="Optional"
        aria-label="Subcategory"
        className="h-10 w-full rounded-xl border border-[#dfe5e4] bg-white px-2.5 text-[0.8125rem] text-ut-text placeholder:text-[#9aa5a8] focus:border-ut-accent focus:outline-none"
      />
      <datalist id="subcategory-suggestions">
        {subs.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}

/** 浅色统计格（Overview 的 By trip 行等） */
export function SoftStat({ label, value }: { label: string; value: string }) {
  return (
    <div className={PANEL_SOFT}>
      <p className="text-[0.625rem] font-medium uppercase tracking-[0.1em] text-[#8a969a]">{label}</p>
      <p className="mt-0.5 text-[0.875rem] font-semibold tabular-nums text-ut-text">{value}</p>
    </div>
  );
}
