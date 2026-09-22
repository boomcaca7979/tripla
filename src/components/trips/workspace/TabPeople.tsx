"use client";

/**
 * TabPeople — 「人 + 数据」矩阵（Workspace-driven 重构，spec #19/20）。
 *
 *  - 矩阵：每行一人，Paid / Share / Balance（净额）三列真实数据；
 *  - 点击人名 → 展开该人支付的交易列表；
 *  - 底部永久捕获行：写名字按 Enter 即成 traveler（Capture first）；
 *  - Settle up（转账建议）保留在矩阵下方。
 */

import { useMemo, useState } from "react";
import type { Trip, WorkspaceAction, WorkspaceState } from "./types";
import { money, settlementForTravelers, txnsForTrip, totalsByCurrency } from "./expenses/engine";
import { SettlementCard } from "./expenses/parts";
import { CaptureLine, HoverDelete } from "./inline";
import { formatTxnDate } from "./expenses/parts";
import { ModuleHead, Panel, T_SECTION } from "./ui";

export default function TabPeople({
  trip,
  transactions,
  dispatch,
}: {
  trip: Trip;
  transactions: WorkspaceState["transactions"];
  dispatch: (action: WorkspaceAction) => void;
  addNonce: number;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const txns = useMemo(() => txnsForTrip(transactions, trip.id), [transactions, trip.id]);
  const settlement = settlementForTravelers(trip.travelers, txns);
  // 矩阵显示币种：跟随该 Trip 交易主币种
  const currency = totalsByCurrency(txns)[0]?.currency ?? trip.currency;

  const paidBy = (id: string) => txns.filter((t) => t.paidBy === id && t.status !== "ignored");
  const involves = (id: string) =>
    txns.filter((t) => t.status === "confirmed" && (t.paidBy === id || t.splitBetween.includes(id)));

  return (
    <div>
      <ModuleHead title="People" meta={`${trip.travelers.length} going`} />

      {/* ── 矩阵 ─────────────────────────────────────────────────── */}
      <Panel className="divide-y divide-[#eef1f0]">
        {settlement.balances.length === 0 && (
          <p className="px-5 pt-6 text-center text-body text-ut-text-2">No travelers yet.</p>
        )}

        {/* 表头 */}
        {settlement.balances.length > 0 && (
          <div className="grid grid-cols-[minmax(0,1.6fr)_5.5rem_5.5rem_6.5rem_minmax(4.5rem,auto)] items-center gap-x-3 px-4 pt-3 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ut-muted">
            <span>Traveler</span>
            <span className="text-right">Paid</span>
            <span className="text-right">Share</span>
            <span className="text-right">Balance</span>
            <span aria-hidden="true" />
          </div>
        )}

        {settlement.balances.map((b) => {
          const expanded = expandedId === b.id;
          return (
            <div key={b.id} className="px-4 py-1.5">
              <div className="group grid grid-cols-[minmax(0,1.6fr)_5.5rem_5.5rem_6.5rem_minmax(4.5rem,auto)] items-center gap-x-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e3e8e7] bg-[#eef3f0] text-[0.8125rem] font-medium text-ut-text-2"
                  >
                    {b.name.slice(0, 1).toUpperCase()}
                  </span>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    className="min-w-0 flex-1 cursor-pointer truncate text-left text-[0.9375rem] font-medium text-ut-ink hover:underline"
                    onClick={() => setExpandedId(expanded ? null : b.id)}
                  >
                    {b.name}
                  </button>
                </div>
                <span className="text-right text-[0.8125rem] tabular-nums text-ut-text">
                  {b.paid > 0 ? money(b.paid, currency) : "—"}
                </span>
                <span className="text-right text-[0.8125rem] tabular-nums text-ut-text">
                  {b.share > 0 ? money(b.share, currency) : "—"}
                </span>
                <span
                  className={`text-right text-[0.8125rem] font-semibold tabular-nums ${
                    Math.abs(b.net) <= 0.5 ? "text-ut-muted" : b.net > 0 ? "text-[#0b6b47]" : "text-[#c4453d]"
                  }`}
                >
                  {Math.abs(b.net) <= 0.5
                    ? "Settled"
                    : b.net > 0
                      ? `+${money(b.net, currency)}`
                      : `−${money(-b.net, currency)}`}
                </span>
                <div className="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
                  {b.id !== trip.travelers[0]?.id && (
                    <HoverDelete
                      label={b.name}
                      onConfirm={() => dispatch({ type: "REMOVE_TRAVELER", tripId: trip.id, travelerId: b.id })}
                    />
                  )}
                </div>
              </div>

              {/* 点击人名 → 该人相关交易 */}
              {expanded && (
                <div className="mb-2 mt-2 rounded-xl border border-[#eef1f0] bg-[#f6f8f7] p-3">
                  <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ut-muted">
                    Paid by {b.name}
                  </p>
                  {paidBy(b.id).length === 0 ? (
                    <p className="text-[0.8125rem] text-ut-text-2">Nothing paid yet.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {paidBy(b.id).map((t) => (
                        <li key={t.id} className="flex items-baseline justify-between gap-3 text-[0.8125rem]">
                          <span className="min-w-0 truncate text-ut-text">
                            {formatTxnDate(t.occurredAt)} · {t.merchant}
                          </span>
                          <span className="shrink-0 tabular-nums text-ut-text-2">
                            {money(t.originalAmount ?? 0, t.originalCurrency)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mb-2 mt-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ut-muted">
                    Shares in
                  </p>
                  <p className="text-[0.8125rem] text-ut-text-2">
                    {involves(b.id).length} confirmed {involves(b.id).length === 1 ? "transaction" : "transactions"}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* 永久捕获行：写名字按 Enter 即成 traveler */}
        <div className="flex items-center gap-3 border-t border-[#eef1f0] px-4">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-[#c6d0ce] text-[0.8125rem] text-[#9aa5a8]"
          >
            +
          </span>
          <CaptureLine
            placeholder="Add traveler..."
            onSubmit={(text) => {
              const name = text.trim();
              if (name) dispatch({ type: "ADD_TRAVELER", tripId: trip.id, name });
            }}
          />
        </div>
      </Panel>

      {/* ── Settle up（转账建议） ────────────────────────────────── */}
      <section className="mt-10">
        <p className={`mb-4 ${T_SECTION}`}>Settle up</p>
        <SettlementCard trip={trip} txns={txns} />
      </section>
    </div>
  );
}
