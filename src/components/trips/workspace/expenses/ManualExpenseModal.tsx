"use client";

/**
 * ManualExpenseModal — "+ Add expense"（spec #21）。
 * 全字段手动输入，提交即为 confirmed（用户本人录入即确认）。
 * Payment source 只是消费来源标记，不是平台连接声明。
 */

import { useMemo, useState } from "react";
import type { Trip, WorkspaceAction } from "../types";
import type { NewTransaction, PaymentMethod } from "./types";
import { CURRENCIES, suggestCategory, suggestTrip } from "./engine";
import { CategorySelect } from "./parts";
import { BTN_GHOST, BTN_PRIMARY, MONO_META, Modal } from "../ui";
import { localId } from "../logic";

const INPUT_CLS =
  "h-10 w-full rounded-xl border border-[#dfe5e4] bg-white px-3 text-[0.875rem] text-ut-text placeholder:text-[#9aa5a8] focus:border-ut-accent focus:outline-none";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card: "Card",
  cash: "Cash",
  alipay: "Alipay",
  wechat_pay: "WeChat Pay",
  other: "Other",
};

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ManualExpenseModal({
  trips,
  dispatch,
  onClose,
  presetTripId,
  defaultCurrency = "CNY",
}: {
  trips: Trip[];
  dispatch: (action: WorkspaceAction) => void;
  onClose: () => void;
  presetTripId?: string;
  defaultCurrency?: string;
}) {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [date, setDate] = useState(todayISO());
  const [tripId, setTripId] = useState(presetTripId ?? "");
  const [category, setCategory] = useState<NewTransaction["category"]>("food");
  const [subcategory, setSubcategory] = useState<string | undefined>(undefined);
  const [paidBy, setPaidBy] = useState<string>("");
  const [splitBetween, setSplitBetween] = useState<string[] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [note, setNote] = useState("");

  const trip = trips.find((t) => t.id === tripId);
  const travelers = trip?.travelers ?? [];
  const effectivePayer = paidBy || travelers[0]?.id || "";
  const effectiveSplit = splitBetween ?? travelers.map((t) => t.id);

  const amt = Number(amount);
  const amountValid = Number.isFinite(amt) && amt > 0;

  // 商户输入时即时给分类建议（帮助，但不强制）
  const suggestion = useMemo(
    () => (merchant.trim().length >= 2 ? suggestCategory(merchant, "", {}) : null),
    [merchant],
  );
  const tripSuggestion = useMemo(
    () =>
      date && merchant.trim().length >= 2 && !tripId
        ? suggestTrip(date, merchant, "", currency, trips)
        : null,
    [merchant, date, currency, tripId, trips],
  );

  const submit = () => {
    if (!merchant.trim() || !amountValid || !date) return;
    if (trip && (travelers.length === 0 || effectiveSplit.length === 0)) return;
    const now = new Date().toISOString();
    const txn: NewTransaction = {
      source: "manual",
      merchant: merchant.trim(),
      occurredAt: date,
      originalAmount: amt,
      originalCurrency: currency,
      category,
      subcategory,
      categoryConfidence: 1,
      tripId: tripId || undefined,
      status: "confirmed",
      paidBy: trip ? effectivePayer : undefined,
      splitBetween: trip ? effectiveSplit : [],
      paymentMethod,
      note: note.trim() || undefined,
    };
    dispatch({ type: "ADD_TXN", txn: { ...txn, id: localId("txn"), createdAt: now, updatedAt: now } });
    onClose();
  };

  return (
    <Modal title="Add expense" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
          <label className="block">
            <span className={`mb-1.5 block ${MONO_META}`}>Merchant</span>
            <input
              className={INPUT_CLS}
              placeholder="e.g. Sushi dinner / Grab"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              autoFocus
            />
          </label>
          <label className="block">
            <span className={`mb-1.5 block ${MONO_META}`}>Amount</span>
            <input
              className={`${INPUT_CLS} text-right tabular-nums`}
              placeholder="0"
              inputMode="decimal"
              value={amount}
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

        {suggestion && suggestion.confidence > 0 && (
          <button
            type="button"
            onClick={() => {
              setCategory(suggestion.category);
              setSubcategory(suggestion.subcategory);
            }}
            className="cursor-pointer rounded-full bg-[#e0f3ea] px-3 py-1.5 text-[0.75rem] font-semibold text-[#0b6b47] transition-colors hover:bg-[#d0ecdf]"
          >
            Suggested: {suggestion.category}
            {suggestion.subcategory ? ` · ${suggestion.subcategory}` : ""} — use it
          </button>
        )}
        {tripSuggestion && (
          <button
            type="button"
            onClick={() => setTripId(tripSuggestion.tripId)}
            className="cursor-pointer rounded-full bg-[#e0f3ea] px-3 py-1.5 text-[0.75rem] font-semibold text-[#0b6b47] transition-colors hover:bg-[#d0ecdf]"
          >
            Looks like {trips.find((t) => t.id === tripSuggestion.tripId)?.destination} ·{" "}
            {Math.round(tripSuggestion.confidence * 100)}% — assign
          </button>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className={`mb-1.5 block ${MONO_META}`}>Date</span>
            <input className={INPUT_CLS} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="block">
            <span className={`mb-1.5 block ${MONO_META}`}>Trip</span>
            <select
              className={INPUT_CLS}
              value={tripId}
              onChange={(e) => {
                setTripId(e.target.value);
                setPaidBy("");
                setSplitBetween(null);
              }}
            >
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
        </div>

        {trip && travelers.length > 0 && (
          <div className="rounded-xl border border-[#eef1f0] bg-[#f6f8f7] p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className={`mb-1.5 block ${MONO_META}`}>Paid by</span>
                <select
                  className={INPUT_CLS}
                  value={effectivePayer}
                  onChange={(e) => setPaidBy(e.target.value)}
                >
                  {travelers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-3">
              <span className={`mb-2 block ${MONO_META}`}>Split between</span>
              <div className="flex flex-wrap gap-2">
                {travelers.map((t) => {
                  const on = effectiveSplit.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setSplitBetween(
                          on
                            ? effectiveSplit.filter((id) => id !== t.id)
                            : [...effectiveSplit, t.id],
                        )
                      }
                      className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-[0.75rem] font-medium transition-colors ${
                        on
                          ? "border-ut-accent bg-[#e0f3ea] text-[#0b6b47]"
                          : "border-[#e8ecec] bg-white text-ut-text-2 hover:border-[#c6d0ce]"
                      }`}
                    >
                      <span aria-hidden="true">{on ? "☑" : "☐"}</span>
                      {t.name}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[0.75rem] text-ut-muted">
                Unequal amounts can be set after saving (open the transaction).
              </p>
            </div>
          </div>
        )}

        <label className="block">
          <span className={`mb-1.5 block ${MONO_META}`}>Note</span>
          <input className={INPUT_CLS} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>

        <div className="flex justify-end gap-2 border-t border-[#eef1f0] pt-4">
          <button type="button" className={BTN_GHOST} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={BTN_PRIMARY}
            onClick={submit}
            disabled={!merchant.trim() || !amountValid || !date}
            style={!merchant.trim() || !amountValid || !date ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
          >
            Add expense
          </button>
        </div>
      </div>
    </Modal>
  );
}
