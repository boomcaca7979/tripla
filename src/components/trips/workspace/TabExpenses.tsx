"use client";

/**
 * TabExpenses — Trip 内 Expenses 工作区（Workspace-driven 重构）。
 *
 * 口径严格分离：Actual spent（confirmed）/ Committed（booked hotel）/ Budget。
 * 视图：Table（默认，inline 交易表）/ Review / By category / Split。
 * 导入/收据走 Modal（复杂流程），日常增改全在表格内完成。
 */

import { useMemo, useState } from "react";
import type { ExpenseCategory, Trip, WorkspaceAction, WorkspaceState } from "./types";
import {
  EXPENSE_CATEGORY_LABELS,
  money,
  reviewQueue,
  totalsByCategory,
  totalsByCurrency,
  txnsForTrip,
} from "./expenses/engine";
import { tripCommitted } from "./logic";
import { ExpenseTable } from "./expenses/ExpenseTable";
import type { Transaction } from "./expenses/types";
import { SettlementCard, formatTxnDate } from "./expenses/parts";
import ReceiptModal from "./expenses/ReceiptModal";
import ImportModal from "./expenses/ImportModal";
import TransactionDetailModal from "./expenses/TransactionDetailModal";
import { BTN_PRIMARY, META_LINE, Panel, TOOLBAR_ACTION, ViewSelect } from "./ui";

type Tab = "table" | "review" | "category" | "split";

export default function TabExpenses({
  trip,
  transactions,
  merchantRules,
  dispatch,
  addNonce,
}: {
  trip: Trip;
  transactions: WorkspaceState["transactions"];
  merchantRules: WorkspaceState["merchantRules"];
  dispatch: (action: WorkspaceAction) => void;
  addNonce: number;
}) {
  const [tab, setTab] = useState<Tab>("table");
  const [importOpen, setImportOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [budgetDraft, setBudgetDraft] = useState("");
  const [editingBudget, setEditingBudget] = useState(false);
  // TripWorkspace "+ Add" nonce：切回 Table（捕获行常驻；React 认可的渲染期派生状态调整）
  const [seenNonce, setSeenNonce] = useState(0);
  if (addNonce > seenNonce) {
    setSeenNonce(addNonce);
    setTab("table");
  }

  const txns = useMemo(() => txnsForTrip(transactions, trip.id), [transactions, trip.id]);
  const pendingReview = useMemo(
    () => reviewQueue(transactions).filter((t) => t.tripId === trip.id),
    [transactions, trip.id],
  );
  const totals = useMemo(() => totalsByCurrency(txns), [txns]);
  const byCategory = useMemo(() => totalsByCategory(txns), [txns]);
  const detail = detailId ? transactions.find((t) => t.id === detailId) : undefined;

  const committed = tripCommitted(trip);
  const budget = trip.budgetPlanned;
  const hasBudget = budget > 0;
  const spentInBudgetCurrency = totals.find((t) => t.currency === trip.currency)?.amount ?? 0;

  const spentLine =
    totals.length > 0
      ? [money(totals[0].amount, totals[0].currency), ...totals.slice(1).map((t) => money(t.amount, t.currency))].join(" · ")
      : money(0, trip.currency);

  return (
    <div>
      {/* ── 一行轻属性（spent / committed / budget 可改）——不是 KPI（spec #8/#32） ── */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className={META_LINE}>
          <span className="font-semibold text-ut-ink">{spentLine}</span> spent
          <span className="mx-2 text-[#a5b0b2]">·</span>
          {txns.length} {txns.length === 1 ? "transaction" : "transactions"}
          {pendingReview.length > 0 && (
            <>
              <span className="mx-2 text-[#a5b0b2]">·</span>
              <button
                type="button"
                className="cursor-pointer font-semibold text-[#8a5a12] hover:underline"
                onClick={() => setTab("review")}
              >
                {pendingReview.length} to review
              </button>
            </>
          )}
          <span className="mx-2 text-[#a5b0b2]">·</span>
          Committed <span className="text-ut-text">{money(committed, trip.currency)}</span>
          <span className="mx-2 text-[#a5b0b2]">·</span>
          {hasBudget
            ? `Remaining ${money(budget - spentInBudgetCurrency - committed, trip.currency)}`
            : "No budget"}
          {hasBudget && (
            <>
              <span className="mx-2 text-[#a5b0b2]">·</span>
              Budget <span className="text-ut-text">{money(budget, trip.currency)}</span>
            </>
          )}
        </p>
        {/* 轻工具栏：视图下拉 + Import/Receipt 次级入口 */}
        <div className="flex items-center gap-4">
          <ViewSelect<Tab>
            value={tab}
            options={[
              { key: "table", label: "Table" },
              { key: "review", label: "Review", badge: pendingReview.length },
              { key: "category", label: "By category" },
              { key: "split", label: "Split" },
            ]}
            onChange={setTab}
            label="Trip expenses view"
          />
          <button type="button" className={TOOLBAR_ACTION} onClick={() => setImportOpen(true)}>
            Import
          </button>
          <button type="button" className={TOOLBAR_ACTION} onClick={() => setReceiptOpen(true)}>
            + Add receipt
          </button>
        </div>
      </div>

      {/* 预算 = property：点击值才进入编辑（spec #13） */}
      <p className={`mt-2 ${META_LINE}`}>
        Budget{" "}
        {editingBudget ? (
          <input
            className="h-7 w-24 rounded-lg border border-ut-accent/60 bg-white px-2 text-right text-[0.75rem] font-medium tabular-nums text-ut-text placeholder:text-[#9aa5a8] focus:outline-none"
            placeholder={String(trip.currency === "CNY" ? "30000" : "amount")}
            inputMode="numeric"
            autoFocus
            value={budgetDraft}
            onChange={(e) => setBudgetDraft(e.target.value)}
            onBlur={() => {
              const n = Number(budgetDraft);
              const next = Number.isFinite(n) && n > 0 ? n : 0;
              dispatch({ type: "SET_BUDGET", tripId: trip.id, amount: next });
              setBudgetDraft("");
              setEditingBudget(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setBudgetDraft("");
                setEditingBudget(false);
              }
            }}
            aria-label="Set budget"
          />
        ) : (
          <button
            type="button"
            className="cursor-pointer font-semibold text-ut-ink hover:underline"
            onClick={() => setEditingBudget(true)}
          >
            {hasBudget ? money(budget, trip.currency) : "Not set"}
          </button>
        )}
        {" · "}click to {hasBudget ? "edit" : "set"}
      </p>

      <div className="pt-5">
        {tab === "table" && (
          <>
            <ExpenseTable
              txns={txns}
              trips={[trip]}
              dispatch={dispatch}
              presetTripId={trip.id}
              defaultCurrency={trip.currency}
              rules={merchantRules}
              onOpenDetail={setDetailId}
            />
          </>
        )}
        {tab === "review" && (
          <ReviewList
            txns={pendingReview}
            dispatch={dispatch}
            onEdit={setDetailId}
            onConfirmAll={() => dispatch({ type: "CONFIRM_TXNS", ids: pendingReview.map((t) => t.id) })}
          />
        )}
        {tab === "category" && (
          <ByCategory byCategory={byCategory} totals={totals} />
        )}
        {tab === "split" && <SettlementCard trip={trip} txns={txns} />}
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      {importOpen && (
        <ImportModal
          trips={[trip]}
          existing={transactions}
          rules={merchantRules}
          dispatch={dispatch}
          onClose={() => setImportOpen(false)}
          onImported={() => setTab("table")}
        />
      )}
      {receiptOpen && (
        <ReceiptModal trips={[trip]} dispatch={dispatch} onClose={() => setReceiptOpen(false)} presetTripId={trip.id} />
      )}
      {detail && (
        <TransactionDetailModal txn={detail} trips={[trip]} dispatch={dispatch} onClose={() => setDetailId(null)} />
      )}
    </div>
  );
}

function ReviewList({
  txns,
  dispatch,
  onEdit,
  onConfirmAll,
}: {
  txns: Transaction[];
  dispatch: (action: WorkspaceAction) => void;
  onEdit: (id: string) => void;
  onConfirmAll: () => void;
}) {
  if (txns.length === 0) {
    return (
      <Panel className="px-5 py-8 text-center">
        <p className="text-[0.8125rem] text-ut-muted">All caught up — nothing to review in this trip.</p>
      </Panel>
    );
  }
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button type="button" className={BTN_PRIMARY} onClick={onConfirmAll}>
          Confirm all
        </button>
      </div>
      <Panel className="divide-y divide-[#eef1f0]">
        {txns.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
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
            <p className="shrink-0 text-[0.875rem] font-semibold tabular-nums text-ut-text">
              {money(t.originalAmount ?? 0, t.originalCurrency)}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="cursor-pointer text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ut-accent hover:text-ut-accent-strong"
                onClick={() => dispatch({ type: "CONFIRM_TXNS", ids: [t.id] })}
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
        ))}
      </Panel>
    </div>
  );
}

function ByCategory({
  byCategory,
  totals,
}: {
  byCategory: Array<{ category: ExpenseCategory; amount: number; currency: string }>;
  totals: Array<{ currency: string; amount: number }>;
}) {
  if (byCategory.length === 0) {
    return (
      <Panel className="px-5 py-8 text-center">
        <p className="text-[0.8125rem] text-ut-muted">No confirmed expenses yet — totals build themselves as you confirm records.</p>
      </Panel>
    );
  }
  const mainCurrency = totals[0]?.currency ?? byCategory[0].currency;
  const grand = totals.find((t) => t.currency === mainCurrency)?.amount ?? 0;
  return (
    <Panel className="divide-y divide-[#eef1f0]">
      {byCategory.map((row) => (
        <div key={`${row.category}-${row.currency}`} className="flex items-center gap-4 px-4 py-3">
          <p className="min-w-0 flex-1 text-[0.875rem] font-medium text-ut-ink">
            {EXPENSE_CATEGORY_LABELS[row.category]}
          </p>
          <div className="hidden h-1.5 w-40 overflow-hidden rounded-full bg-[#eef1f0] sm:block">
            <div
              className="h-full rounded-full bg-ut-accent/60"
              style={{ width: `${grand > 0 ? Math.round((row.amount / grand) * 100) : 0}%` }}
            />
          </div>
          <p className="w-24 shrink-0 text-right text-[0.875rem] font-semibold tabular-nums text-ut-text">
            {money(row.amount, row.currency)}
          </p>
          <p className="w-12 shrink-0 text-right text-[0.6875rem] tabular-nums text-[#9aa5a8]">
            {grand > 0 && row.currency === mainCurrency ? `${Math.round((row.amount / grand) * 100)}%` : ""}
          </p>
        </div>
      ))}
    </Panel>
  );
}
