"use client";

/**
 * ExpensesWorkspace — Global Expenses（Level 1，sidebar Expenses 进入）。
 *
 * Workspace-driven 重构（spec #4/#8/#9）：
 *  - 视图 = 同一套 Transaction 数据的多角度：Table / Review / By category / By trip / Split；
 *  - Table 是默认视图（可视化交易表，inline cell 编辑 + Add row）；
 *  - Review 保留批量确认，并支持批量设置 category / trip；
 *  - Import / Receipt 走 Drawer/Modal（复杂流程允许），完成后落回 Review/Table。
 */

import { useMemo, useState } from "react";
import type { ExpenseCategory, WorkspaceAction, WorkspaceState } from "../types";
import {
  EXPENSE_CATEGORY_LABELS,
  money,
  reviewQueue,
  settlementForTravelers,
  totalsByCategory,
  totalsByCurrency,
  txnsForTrip,
} from "./engine";
import { SettlementCard, formatTxnDate } from "./parts";
import { ExpenseTable } from "./ExpenseTable";
import ReceiptModal from "./ReceiptModal";
import ImportModal from "./ImportModal";
import TransactionDetailModal from "./TransactionDetailModal";
import {
  BTN_GHOST,
  BTN_PRIMARY,
  META_LINE,
  MONO_META,
  Panel,
  T_META,
  T_PAGE,
  TOOLBAR_ACTION,
  ViewSelect,
} from "../ui";

type Tab = "table" | "review" | "category" | "byTrip" | "split";

export default function ExpensesWorkspace({
  state,
  dispatch,
  onOpenTrip,
}: {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  onOpenTrip: (tripId: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("table");
  const [importOpen, setImportOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { trips, transactions, merchantRules } = state;
  const review = useMemo(() => reviewQueue(transactions), [transactions]);
  const totals = useMemo(() => totalsByCurrency(transactions), [transactions]);
  const detail = detailId ? transactions.find((t) => t.id === detailId) : undefined;


  const spentLine =
    totals.length > 0
      ? [money(totals[0].amount, totals[0].currency), ...totals.slice(1).map((t) => money(t.amount, t.currency))].join(" · ")
      : money(0, "CNY");

  return (
    <div>
      {/* ── 克制标题 + 轻工具栏（spec #2/#4/#5/#39） ───────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className={T_PAGE}>Expenses</h1>
          {/* 一行轻 meta：不是 KPI（spec #8） */}
          <p className={META_LINE}>
            {transactions.filter((t) => t.status !== "ignored").length}{" "}
            {transactions.length === 1 ? "transaction" : "transactions"} · {spentLine} spent
            {review.length > 0 && (
              <>
                {" · "}
                <button
                  type="button"
                  className="cursor-pointer font-semibold text-[#8a5a12] hover:underline"
                  onClick={() => setTab("review")}
                >
                  {review.length} to review
                </button>
              </>
            )}
          </p>
        </div>
        {/* 轻工具栏：视图下拉 + 次级文字操作（Import/Receipt 不比内容醒目） */}
        <div className="flex items-center gap-4">
          <ViewSelect<Tab>
            value={tab}
            options={[
              { key: "table", label: "Table" },
              { key: "review", label: "Review", badge: review.length },
              { key: "category", label: "By category" },
              { key: "byTrip", label: "By trip" },
              { key: "split", label: "Split" },
            ]}
            onChange={setTab}
            label="Expenses view"
          />
          <button type="button" className={TOOLBAR_ACTION} onClick={() => setImportOpen(true)}>
            Import
          </button>
          <button type="button" className={TOOLBAR_ACTION} onClick={() => setReceiptOpen(true)}>
            + Add receipt
          </button>
        </div>
      </div>

      <div className="pt-5">
        {tab === "table" && (
          <ExpenseTable
            txns={transactions}
            trips={trips}
            dispatch={dispatch}
            rules={merchantRules}
            onOpenDetail={setDetailId}
          />
        )}
        {tab === "review" && <ReviewTab state={state} dispatch={dispatch} onEdit={setDetailId} />}
        {tab === "category" && <ByCategoryTab state={state} />}
        {tab === "byTrip" && (
          <ByTripTab state={state} onOpenTrip={onOpenTrip} onImport={() => setImportOpen(true)} />
        )}
        {tab === "split" && <SplitTab state={state} />}
      </div>

      {/* ── Modals（Import/Receipt 是复杂流程，允许 Drawer/Modal） ── */}
      {importOpen && (
        <ImportModal
          trips={trips}
          existing={transactions}
          rules={state.merchantRules}
          dispatch={dispatch}
          onClose={() => setImportOpen(false)}
          onImported={() => setTab("table")}
        />
      )}
      {receiptOpen && (
        <ReceiptModal trips={trips} dispatch={dispatch} onClose={() => setReceiptOpen(false)} />
      )}
      {detail && (
        <TransactionDetailModal
          txn={detail}
          trips={trips}
          dispatch={dispatch}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}

// ── Review：批量确认 + 批量设置 category / trip（spec #9） ────────────

function ReviewTab({
  state,
  dispatch,
  onEdit,
}: {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  onEdit: (id: string) => void;
}) {
  const queue = useMemo(() => reviewQueue(state.transactions), [state.transactions]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = queue.length > 0 && queue.every((t) => selected.has(t.id));
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const confirmIds = (ids: string[]) => {
    dispatch({ type: "CONFIRM_TXNS", ids });
    setSelected(new Set());
  };

  const batchCategory = (category: ExpenseCategory) => {
    for (const id of selected) dispatch({ type: "UPDATE_TXN", id, patch: { category } });
    setSelected(new Set());
  };
  const batchTrip = (tripId: string) => {
    for (const id of selected) {
      const t = state.transactions.find((x) => x.id === id);
      const trip = state.trips.find((tr) => tr.id === tripId);
      dispatch({
        type: "UPDATE_TXN",
        id,
        patch: {
          tripId: tripId || undefined,
          paidBy: t?.paidBy ?? trip?.travelers[0]?.id,
          splitBetween: t && t.splitBetween.length > 0 ? t.splitBetween : (trip?.travelers.map((x) => x.id) ?? []),
        },
      });
    }
    setSelected(new Set());
  };

  if (queue.length === 0) {
    return (
      <Panel className="px-5 py-8 text-center">
        <p className="text-[0.8125rem] text-ut-muted">All caught up — nothing to review.</p>
      </Panel>
    );
  }

  const selectCls =
    "h-9 cursor-pointer rounded-full border border-[#dfe5e4] bg-white px-3 text-[0.75rem] font-semibold text-ut-text-2 focus:outline-none";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.9375rem] font-bold text-ut-ink">
          Review transactions
          <span className={`ml-3 ${META_LINE}`}>{queue.length} to review</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={BTN_GHOST}
            onClick={() => setSelected(allSelected ? new Set() : new Set(queue.map((t) => t.id)))}
          >
            {allSelected ? "Clear selection" : "Select all"}
          </button>
          {selected.size > 0 && (
            <>
              <select
                className={selectCls}
                value=""
                onChange={(e) => e.target.value && batchCategory(e.target.value as ExpenseCategory)}
                aria-label="Set category for selected"
              >
                <option value="">Set category…</option>
                {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {EXPENSE_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <select
                className={selectCls}
                value=""
                onChange={(e) => e.target.value && batchTrip(e.target.value)}
                aria-label="Set trip for selected"
              >
                <option value="">Set trip…</option>
                {state.trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.destination}
                  </option>
                ))}
                <option value="">Unassigned</option>
              </select>
            </>
          )}
          <button
            type="button"
            className={BTN_PRIMARY}
            onClick={() => confirmIds([...selected])}
            disabled={selected.size === 0}
            style={selected.size === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
          >
            Confirm selected{selected.size > 0 ? ` (${selected.size})` : ""}
          </button>
        </div>
      </div>

      {/* Review 表格式：Merchant / Suggested / Trip / Confidence + Confirm */}
      <Panel className="divide-y divide-[#eef1f0]">
        {queue.map((t) => {
          const trip = state.trips.find((tr) => tr.id === t.tripId);
          return (
            <div key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <input
                type="checkbox"
                checked={selected.has(t.id)}
                onChange={() => toggle(t.id)}
                aria-label={`Select ${t.merchant}`}
                className="h-4 w-4 shrink-0 cursor-pointer accent-[#10b981]"
              />
              <div className="min-w-0 flex-[2]">
                <p className="truncate text-[0.875rem] font-medium text-ut-ink">{t.merchant}</p>
                <p className="text-[0.6875rem] text-[#9aa5a8]">{formatTxnDate(t.occurredAt)}</p>
              </div>
              <p className="min-w-0 flex-1 text-[0.8125rem] text-ut-text-2">
                {t.category ? EXPENSE_CATEGORY_LABELS[t.category] : "—"}
                {t.tripConfidence != null && (
                  <span className="ml-2 tabular-nums text-[#9aa5a8]">{Math.round(t.tripConfidence * 100)}%</span>
                )}
              </p>
              <p className="min-w-0 flex-1 text-[0.8125rem] text-ut-text-2">
                {trip ? trip.destination : "Unassigned"}
              </p>
              <p className="shrink-0 text-[0.875rem] font-semibold tabular-nums text-ut-text">
                {money(t.originalAmount ?? 0, t.originalCurrency)}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ut-accent hover:text-ut-accent-strong"
                  onClick={() => confirmIds([t.id])}
                >
                  ✓ Confirm
                </button>
                <button
                  type="button"
                  className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#8a969a] hover:text-ut-ink"
                  onClick={() => onEdit(t.id)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#8a969a] hover:text-ut-ink"
                  onClick={() => dispatch({ type: "IGNORE_TXNS", ids: [t.id] })}
                >
                  Ignore
                </button>
              </div>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}

// ── By category：分类分组小计 ────────────────────────────────────────

function ByCategoryTab({ state }: { state: WorkspaceState }) {
  const active = state.transactions.filter((t) => t.status === "confirmed");
  const byCat = useMemo(() => totalsByCategory(active), [active]);

  if (byCat.length === 0) {
    return (
      <Panel className="px-5 py-8 text-center">
        <p className="text-[0.8125rem] text-ut-muted">No confirmed expenses yet — totals build themselves as you confirm records.</p>
      </Panel>
    );
  }

  const grand = byCat.filter((r) => r.currency === byCat[0].currency).reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      {Object.entries(
        byCat.reduce<Record<string, typeof byCat>>((acc, row) => {
          (acc[row.currency] ??= []).push(row);
          return acc;
        }, {}),
      ).map(([currency, rows]) => (
        <section key={currency} className="mb-8">
          <p className={`mb-3 ${MONO_META}`}>{currency}</p>
          <Panel className="divide-y divide-[#eef1f0]">
            {rows.map((row) => (
              <div key={row.category} className="flex items-center gap-4 px-4 py-3">
                <p className="min-w-0 flex-1 text-[0.875rem] font-medium text-ut-ink">
                  {EXPENSE_CATEGORY_LABELS[row.category as ExpenseCategory]}
                </p>
                <div className="hidden h-1.5 w-40 overflow-hidden rounded-full bg-[#eef1f0] sm:block">
                  <div
                    className="h-full rounded-full bg-ut-accent/60"
                    style={{ width: `${grand > 0 ? Math.round((row.amount / grand) * 100) : 0}%` }}
                  />
                </div>
                <p className="w-24 shrink-0 text-right text-[0.875rem] font-semibold tabular-nums text-ut-text">
                  {money(row.amount, currency)}
                </p>
                <p className="w-12 shrink-0 text-right text-[0.6875rem] tabular-nums text-[#9aa5a8]">
                  {grand > 0 ? `${Math.round((row.amount / grand) * 100)}%` : ""}
                </p>
              </div>
            ))}
          </Panel>
        </section>
      ))}
    </div>
  );
}

// ── By trip：原 Overview 内容 ────────────────────────────────────────

function ByTripTab({
  state,
  onOpenTrip,
  onImport,
}: {
  state: WorkspaceState;
  onOpenTrip: (tripId: string) => void;
  onImport: () => void;
}) {
  const { trips, transactions } = state;
  const groups = trips
    .map((trip) => ({ trip, totals: txnsForTrip(transactions, trip.id) }))
    .filter((g) => g.totals.length > 0);
  const unassigned = txnsForTrip(transactions);

  if (groups.length === 0 && unassigned.length === 0) {
    return (
      <Panel className="px-5 py-8 text-center">
        <p className="text-[0.8125rem] text-ut-muted">
          Nothing yet — records land here grouped by trip.{" "}
          <button type="button" className="cursor-pointer font-semibold text-ut-accent hover:underline" onClick={onImport}>
            Import
          </button>{" "}
          or type in the Table view.
        </p>
      </Panel>
    );
  }

  return (
    <div>
      <p className={`mb-3 ${MONO_META}`}>By trip</p>
      <div className="space-y-3">
        {groups.map(({ trip, totals: txns }) => {
          const tripTotals = totalsByCurrency(txns);
          return (
            <button
              key={trip.id}
              type="button"
              onClick={() => onOpenTrip(trip.id)}
              className="flex w-full cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-[#e8ecec] bg-white px-5 py-4 text-left transition-colors hover:border-[#d7dedd]"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[1rem] font-bold text-ut-ink">{trip.destination}</span>
                <span className={`block ${META_LINE}`}>
                  {txns.length} {txns.length === 1 ? "transaction" : "transactions"}
                  {trip.status === "past" && " · Completed"}
                </span>
              </span>
              <span className="text-[1rem] font-semibold tabular-nums text-ut-text">
                {tripTotals.length > 0
                  ? money(tripTotals[0].amount, tripTotals[0].currency)
                  : money(0, trip.currency)}
              </span>
              <span aria-hidden="true" className="text-[0.8rem] text-[#8a969a]">→</span>
            </button>
          );
        })}
        {unassigned.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-dashed border-[#dfe5e4] bg-[#f6f8f7] px-5 py-4">
            <span className="min-w-0 flex-1">
              <span className="block text-[1rem] font-bold text-ut-ink">Unassigned</span>
              <span className={`block ${META_LINE}`}>
                {unassigned.length} {unassigned.length === 1 ? "transaction" : "transactions"} · no trip yet
              </span>
            </span>
            <span className="text-[1rem] font-semibold tabular-nums text-ut-text">
              {totalsByCurrency(unassigned)
                .map((t) => `${money(t.amount, t.currency)}`)
                .join(" · ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Split：全局结算 ──────────────────────────────────────────────────

function SplitTab({ state }: { state: WorkspaceState }) {
  const { trips, transactions } = state;
  const [selectedTrip, setSelectedTrip] = useState<string>(trips[0]?.id ?? "");

  const perTrip = trips.map((trip) => {
    const txns = txnsForTrip(transactions, trip.id);
    const you = trip.travelers[0];
    const settlement = you ? settlementForTravelers(trip.travelers, txns) : null;
    const youBalance = settlement?.balances.find((b) => b.id === you?.id);
    return { trip, count: txns.length, youBalance };
  });

  const withSplits = perTrip.filter((p) => p.count > 0);
  const current = trips.find((t) => t.id === selectedTrip) ?? trips[0];

  if (trips.length === 0) {
    return (
      <Panel className="px-5 py-8 text-center">
        <p className="text-[0.8125rem] text-ut-muted">No trips yet — create one and every split expense settles here.</p>
      </Panel>
    );
  }

  return (
    <div>
      <p className={`mb-3 ${MONO_META}`}>All trips</p>
      {withSplits.length === 0 ? (
        <Panel className="p-6">
          <p className="text-[0.875rem] text-ut-text-2">
            No split expenses yet — assign transactions to trips and mark who was there.
          </p>
        </Panel>
      ) : (
        <div className="space-y-2">
          {withSplits.map((p) => (
            <button
              key={p.trip.id}
              type="button"
              onClick={() => setSelectedTrip(p.trip.id)}
              className={`flex w-full cursor-pointer flex-wrap items-center gap-x-4 rounded-2xl border px-5 py-3.5 text-left transition-colors ${
                selectedTrip === p.trip.id ? "border-ut-accent bg-white" : "border-[#e8ecec] bg-white hover:border-[#d7dedd]"
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[0.9375rem] font-bold text-ut-ink">{p.trip.destination}</span>
                <span className={`block ${META_LINE}`}>
                  {p.count} {p.count === 1 ? "transaction" : "transactions"}
                </span>
              </span>
              {p.youBalance && Math.abs(p.youBalance.net) > 0.5 ? (
                <span
                  className={`text-[0.875rem] font-semibold tabular-nums ${
                    p.youBalance.net > 0 ? "text-[#0b6b47]" : "text-[#c4453d]"
                  }`}
                >
                  {p.youBalance.net > 0
                    ? `You should receive ${money(p.youBalance.net, p.trip.currency)}`
                    : `You owe ${money(-p.youBalance.net, p.trip.currency)}`}
                </span>
              ) : (
                <span className={`text-[0.8125rem] font-semibold text-ut-muted`}>Settled</span>
              )}
            </button>
          ))}
        </div>
      )}

      {current && (
        <section className="mt-8">
          <p className={`mb-3 ${T_META}`}>
            {current.destination} · {formatTxnDate(current.startDate)} — {formatTxnDate(current.endDate)}
          </p>
          <SettlementCard trip={current} txns={txnsForTrip(transactions, current.id)} />
        </section>
      )}
    </div>
  );
}
