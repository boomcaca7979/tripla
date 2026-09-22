"use client";

/**
 * TransactionDetailModal — 点击交易后的 Modal / Drawer 展开（spec #46）。
 * 编辑：merchant / amount / currency / date / category / trip / paid by /
 * split（Equal / Amount / Percentage，总额必须严格等于交易金额）/ note /
 * payment source；可 View original（导入原始描述）；删除需确认。
 */

import { useMemo, useState } from "react";
import type { ExpenseCategory, Trip, WorkspaceAction } from "../types";
import type { PaymentMethod, SplitMode, Transaction } from "./types";
import {
  CURRENCIES,
  displayAmount,
  displayCurrency,
  money,
  suggestTrip,
} from "./engine";
import { CategorySelect, SOURCE_LABEL, StatusChip } from "./parts";
import { BTN_GHOST, BTN_PRIMARY, MONO_META, Modal, T_META } from "../ui";

const INPUT_CLS =
  "h-10 w-full rounded-xl border border-[#dfe5e4] bg-white px-3 text-[0.875rem] text-ut-text placeholder:text-[#9aa5a8] focus:border-ut-accent focus:outline-none";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card: "Card",
  cash: "Cash",
  alipay: "Alipay",
  wechat_pay: "WeChat Pay",
  other: "Other",
};

export default function TransactionDetailModal({
  txn,
  trips,
  dispatch,
  onClose,
}: {
  txn: Transaction;
  trips: Trip[];
  dispatch: (action: WorkspaceAction) => void;
  onClose: () => void;
}) {
  const [merchant, setMerchant] = useState(txn.merchant);
  const [amount, setAmount] = useState(txn.originalAmount != null ? String(txn.originalAmount) : "");
  const [currency, setCurrency] = useState(txn.originalCurrency);
  const [date, setDate] = useState(txn.occurredAt);
  const [category, setCategory] = useState<ExpenseCategory | null>(txn.category);
  const [subcategory, setSubcategory] = useState<string | undefined>(txn.subcategory);
  const [tripId, setTripId] = useState<string>(txn.tripId ?? "");
  const [note, setNote] = useState(txn.note ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(txn.paymentMethod ?? "other");

  // Split 状态
  const [splitMode, setSplitMode] = useState<SplitMode>(txn.splitMode ?? "equal");
  const [splitBetween, setSplitBetween] = useState<string[]>(txn.splitBetween);
  const [splitShares, setSplitShares] = useState<Record<string, number>>(txn.splitShares ?? {});

  const trip = trips.find((t) => t.id === tripId);
  const travelers = trip?.travelers ?? [];

  // 换 Trip 时同步 split 成员（默认全员）
  const onTripChange = (nextTripId: string) => {
    setTripId(nextTripId);
    const nextTrip = trips.find((t) => t.id === nextTripId);
    const ids = nextTrip?.travelers.map((t) => t.id) ?? [];
    setSplitBetween(ids);
    setSplitShares({});
    setSplitMode("equal");
    // 依据日期 + 商户重新给一次建议置信度展示（不强制）
    if (nextTrip) {
      const suggestion = suggestTrip(date, merchant, txn.rawMerchant ?? "", currency, [nextTrip]);
      setReconfidence(suggestion?.confidence);
    } else {
      setReconfidence(undefined);
    }
  };
  const [reconfidence, setReconfidence] = useState<number | undefined>(undefined);

  const amt = Number(amount);
  const hasAmount = amount.trim() !== "" && Number.isFinite(amt) && amt > 0;

  // 不等额校验：总额必须严格等于交易金额
  const shareTotal = useMemo(
    () => splitBetween.reduce((sum, id) => sum + (splitShares[id] ?? 0), 0),
    [splitBetween, splitShares],
  );
  const pctTotal = useMemo(
    () => splitBetween.reduce((sum, id) => sum + (splitShares[id] ?? 0), 0),
    [splitBetween, splitShares],
  );
  const splitInvalid =
    splitMode === "amount"
      ? hasAmount && Math.abs(shareTotal - amt) > 0.5
      : splitMode === "percentage"
        ? Math.abs(pctTotal - 100) > 0.5
        : false;

  // Capture first：merchant 或 amount 任一有内容即可保存（无业务必填字段）
  const canSave = (merchant.trim() !== "" || hasAmount) && !splitInvalid;

  const categoryChanged = category != null && category !== txn.category;

  const save = () => {
    if (!canSave) return;
    dispatch({
      type: "UPDATE_TXN",
      id: txn.id,
      learn: categoryChanged && txn.status === "confirmed",
      patch: {
        merchant: merchant.trim(),
        rawMerchant: txn.rawMerchant,
        // 清空金额 = 回到 draft（以后再补）；有金额 = confirmed
        originalAmount: hasAmount ? amt : undefined,
        originalCurrency: currency,
        occurredAt: date,
        category,
        subcategory,
        tripId: tripId || undefined,
        tripConfidence: reconfidence ?? txn.tripConfidence,
        note: note.trim() || undefined,
        paymentMethod,
        status: hasAmount ? "confirmed" : "draft",
        paidBy: trip
          ? travelers.some((t) => t.id === txn.paidBy)
            ? txn.paidBy
            : travelers[0]?.id
          : undefined,
        splitBetween,
        splitMode,
        splitShares: splitMode === "equal" ? undefined : splitShares,
      },
    });
    onClose();
  };

  const remove = () => {
    if (window.confirm(`Delete "${txn.merchant}"? Imported records are kept as ignored so re-import stays clean.`)) {
      dispatch({ type: "DELETE_TXN", id: txn.id });
      onClose();
    }
  };

  return (
    <Modal title="Transaction" onClose={onClose}>
      <div className="space-y-4">
        {/* 元信息 */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip status={txn.status} />
          <span className="rounded-full bg-[#f0f2f1] px-2.5 py-0.5 text-[0.6875rem] font-semibold text-ut-muted">
            {SOURCE_LABEL[txn.source]}
          </span>
          {txn.rawMerchant && txn.rawMerchant !== txn.merchant && (
            <span className={`truncate ${T_META}`} title={txn.rawMerchant}>
              Original: {txn.rawMerchant}
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
          <label className="block">
            <span className={`mb-1.5 block ${MONO_META}`}>Merchant</span>
            <input className={INPUT_CLS} value={merchant} onChange={(e) => setMerchant(e.target.value)} />
          </label>
          <label className="block">
            <span className={`mb-1.5 block ${MONO_META}`}>Amount</span>
            <input
              className={`${INPUT_CLS} text-right tabular-nums`}
              value={amount}
              inputMode="decimal"
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label className="block">
            <span className={`mb-1.5 block ${MONO_META}`}>Currency</span>
            <select className={INPUT_CLS} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className={`mb-1.5 block ${MONO_META}`}>Date</span>
            <input className={INPUT_CLS} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="block">
            <span className={`mb-1.5 block ${MONO_META}`}>Trip</span>
            <select className={INPUT_CLS} value={tripId} onChange={(e) => onTripChange(e.target.value)}>
              <option value="">Unassigned</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.destination}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={`mb-1.5 block ${MONO_META}`}>Payment source</span>
            <select
              className={INPUT_CLS}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((p) => (
                <option key={p} value={p}>
                  {PAYMENT_LABELS[p]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <span className={`mb-1.5 block ${MONO_META}`}>Category</span>
          <CategorySelect
            category={category}
            subcategory={subcategory}
            onCategory={setCategory}
            onSubcategory={setSubcategory}
          />
          {categoryChanged && (
            <p className="mt-1.5 text-[0.75rem] text-ut-muted">
              Future transactions from this merchant will use your choice.
            </p>
          )}
        </div>

        {/* Split 编辑（需要归属 Trip 才有成员） */}
        {trip ? (
          <div className="rounded-xl border border-[#eef1f0] bg-[#f6f8f7] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={MONO_META}>Split between</span>
              <div className="flex gap-1 rounded-full border border-[#dfe5e4] bg-white p-0.5">
                {(["equal", "amount", "percentage"] as SplitMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setSplitMode(m);
                      setSplitShares({});
                    }}
                    className={`h-7 cursor-pointer rounded-full px-3 text-[0.6875rem] font-semibold capitalize transition-colors ${
                      splitMode === m ? "bg-[#e0f3ea] text-[#0b6b47]" : "text-ut-text-2 hover:text-ut-ink"
                    }`}
                  >
                    {m === "equal" ? "Equal" : m === "amount" ? "Amount" : "Percentage"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {travelers.map((t) => {
                const on = splitBetween.includes(t.id);
                return (
                  <div key={t.id} className="flex items-center gap-3">
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() =>
                          setSplitBetween((prev) =>
                            on ? prev.filter((id) => id !== t.id) : [...prev, t.id],
                          )
                        }
                        className="h-4 w-4 cursor-pointer accent-[#0aa56c]"
                      />
                      <span className="truncate text-[0.875rem] text-ut-text">{t.name}</span>
                      <span className="text-[0.75rem] tabular-nums text-ut-muted">
                        {on
                          ? splitMode === "equal"
                            ? money(displayAmount({ ...txn, originalAmount: hasAmount ? amt : 0, splitBetween: splitBetween }) / Math.max(1, splitBetween.length), displayCurrency(txn))
                            : splitMode === "amount"
                              ? money(splitShares[t.id] ?? 0, displayCurrency(txn))
                              : `${splitShares[t.id] ?? 0}%`
                          : ""}
                      </span>
                    </label>
                    {on && splitMode !== "equal" && (
                      <input
                        className="h-8 w-24 rounded-lg border border-[#dfe5e4] bg-white px-2 text-right text-[0.8125rem] tabular-nums focus:border-ut-accent focus:outline-none"
                        inputMode="decimal"
                        value={splitShares[t.id] ?? ""}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          setSplitShares((prev) => ({
                            ...prev,
                            [t.id]: Number.isFinite(n) ? n : 0,
                          }));
                        }}
                        aria-label={`Share for ${t.name}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {splitInvalid && (
              <p className="mt-2 text-[0.75rem] font-semibold text-[#c4453d]">
                {splitMode === "amount"
                  ? `Shares total ${money(shareTotal, displayCurrency(txn))} — must equal ${money(amt, displayCurrency(txn))}.`
                  : `Percentages total ${Math.round(pctTotal * 10) / 10}% — must equal 100%.`}
              </p>
            )}
            <p className={`mt-2 ${T_META}`}>
              Paid by {travelers.find((t) => t.id === txn.paidBy)?.name ?? "You"} · split does not change the
              actual amount spent.
            </p>
          </div>
        ) : (
          <p className={`rounded-xl border border-dashed border-[#e3e8e7] p-3 text-center ${T_META}`}>
            Assign to a trip to split between travelers.
          </p>
        )}

        <label className="block">
          <span className={`mb-1.5 block ${MONO_META}`}>Note</span>
          <input className={INPUT_CLS} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eef1f0] pt-4">
          <button
            type="button"
            onClick={remove}
            className="cursor-pointer text-[0.75rem] font-semibold text-[#8a969a] transition-colors hover:text-[#c4453d]"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button type="button" className={BTN_GHOST} onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className={BTN_PRIMARY}
              onClick={save}
              disabled={!canSave}
              style={!canSave ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
