"use client";

/**
 * ImportModal — "Import transactions"（spec #7-#10，本轮核心功能）。
 *
 * 流程：选择 / 拖入 CSV 或 Excel → 字段映射（自动识别 + 手动修正）→
 * Preview（N found · D duplicates skipped · M new）→ 全部进入 Review。
 * 绝不直接写入正式账本；去重键 = source + sourceTransactionId + date + merchant + amount + currency。
 */

import { useMemo, useRef, useState } from "react";
import type { Trip, WorkspaceAction } from "../types";
import type { MerchantRule, Transaction } from "./types";
import {
  autoMapColumns,
  draftsToTransactions,
  dedupeAgainst,
  money,
  parseCSV,
  parseXLSX,
  rowsToDrafts,
  type ColumnMapping,
  type FieldKey,
  type ParsedTable,
} from "./engine";
import { BTN_GHOST, BTN_PRIMARY, MONO_META, Modal, T_META } from "../ui";

type Step = "file" | "mapping" | "preview";

const FIELDS: Array<{ key: FieldKey; label: string; required: boolean }> = [
  { key: "date", label: "Date", required: true },
  { key: "merchant", label: "Merchant", required: true },
  { key: "amount", label: "Amount", required: true },
  { key: "currency", label: "Currency", required: false },
  { key: "description", label: "Description", required: false },
];

export default function ImportModal({
  trips,
  existing,
  rules,
  dispatch,
  onClose,
  onImported,
}: {
  trips: Trip[];
  /** 现有账本（用于去重比对，含 ignored 历史记录） */
  existing: Transaction[];
  /** 用户学到的 merchant rules（分类建议第一优先级） */
  rules: Record<string, MerchantRule>;
  dispatch: (action: WorkspaceAction) => void;
  onClose: () => void;
  onImported: () => void;
}) {
  const [step, setStep] = useState<Step>("file");
  const [source, setSource] = useState<"csv" | "xlsx">("csv");
  const [fileName, setFileName] = useState("");
  const [table, setTable] = useState<ParsedTable | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("file");
    setFileName("");
    setTable(null);
    setMapping({});
    setError("");
  };

  const onFile = async (file: File) => {
    setBusy(true);
    setError("");
    setFileName(file.name);
    try {
      const lower = file.name.toLowerCase();
      let parsed: ParsedTable;
      if (lower.endsWith(".xlsx")) {
        parsed = await parseXLSX(await file.arrayBuffer());
        setSource("xlsx");
      } else if (lower.endsWith(".xls")) {
        setError("Legacy .xls is not supported — export as .xlsx or CSV and try again.");
        setBusy(false);
        return;
      } else {
        parsed = parseCSV(await file.text());
        setSource("csv");
      }
      if (parsed.rows.length === 0) {
        setError("No data rows found in this file.");
        setBusy(false);
        return;
      }
      setTable(parsed);
      setMapping(autoMapColumns(parsed));
      setStep("mapping");
    } catch {
      setError("Couldn't read this file. For Excel, re-export as .xlsx or CSV.");
    }
    setBusy(false);
  };

  // 映射 → 草稿 → 建议分类/Trip → 去重
  const result = useMemo(() => {
    if (!table) return null;
    const drafts = rowsToDrafts(table, mapping);
    const valid = drafts.filter((d) => d.ok);
    const invalid = drafts.length - valid.length;
    const txns = draftsToTransactions(valid, source, trips, rules);
    const { fresh, duplicates } = dedupeAgainst(txns, existing);
    return { drafts, valid, invalid, txns, fresh, duplicates };
  }, [table, mapping, source, trips, existing, rules]);

  const commit = () => {
    if (!result || result.fresh.length === 0) return;
    dispatch({ type: "IMPORT_TXNS", txns: result.fresh, label: source === "csv" ? "CSV" : "Excel" });
    onImported();
    onClose();
  };

  return (
    <Modal title="Import transactions" onClose={onClose}>
      {step === "file" && (
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#dfe5e4] bg-[#f6f8f7] px-4 py-12 transition-colors hover:border-ut-accent"
          >
            <span className="text-[1.5rem]" aria-hidden="true">📥</span>
            <span className="text-[0.9375rem] font-semibold text-ut-ink">
              {busy ? "Reading…" : "Drop CSV or Excel here"}
            </span>
            <span className="text-[0.75rem] text-ut-muted">or click to choose a file</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
          />
          {error && (
            <p className="mt-3 text-[0.8125rem] font-semibold text-[#c4453d]">{error}</p>
          )}
          <p className={`mt-4 ${T_META}`}>
            Columns are detected automatically — Date, Merchant, Amount, Currency, Description. Everything
            imported lands in Review first, and duplicates are skipped.
          </p>
        </div>
      )}

      {step === "mapping" && table && (
        <div>
          <p className={`mb-4 ${T_META}`}>
            <span className="font-semibold text-ut-ink">{fileName}</span> · {table.rows.length} rows found.
            Match the columns if needed.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <label key={f.key} className="block">
                <span className={`mb-1.5 block ${MONO_META}`}>
                  {f.label}
                  {f.required && <span className="ml-1 text-[#c4453d]">*</span>}
                </span>
                <select
                  className="h-10 w-full cursor-pointer rounded-xl border border-[#dfe5e4] bg-white px-3 text-[0.875rem] text-ut-text focus:border-ut-accent focus:outline-none"
                  value={mapping[f.key] ?? ""}
                  onChange={(e) =>
                    setMapping((prev) => ({
                      ...prev,
                      [f.key]: e.target.value === "" ? undefined : Number(e.target.value),
                    }))
                  }
                >
                  <option value="">— none —</option>
                  {table.headers.map((h, i) => (
                    <option key={i} value={i}>
                      {h.trim() || `Column ${i + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className={BTN_GHOST} onClick={reset}>
              Back
            </button>
            <button
              type="button"
              className={BTN_PRIMARY}
              onClick={() => setStep("preview")}
              disabled={mapping.date == null || mapping.merchant == null || mapping.amount == null}
              style={
                mapping.date == null || mapping.merchant == null || mapping.amount == null
                  ? { opacity: 0.5, cursor: "not-allowed" }
                  : undefined
              }
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === "preview" && result && (
        <div>
          <p className="text-[1.0625rem] font-bold text-ut-ink">
            {result.valid.length} transactions found
          </p>
          <p className={`mt-1 ${T_META}`}>
            {result.fresh.length} new · {result.duplicates.length} duplicates skipped
            {result.invalid > 0 && ` · ${result.invalid} rows missing date/amount skipped`}
          </p>

          <div className="mt-4 max-h-72 overflow-y-auto rounded-2xl border border-[#e8ecec]">
            <div className="divide-y divide-[#eef1f0]">
              {result.fresh.slice(0, 50).map((t) => {
                const trip = t.tripId ? trips.find((x) => x.id === t.tripId) : undefined;
                return (
                  <div key={t.id} className="flex items-baseline gap-x-3 px-4 py-2.5">
                    <span className="w-16 shrink-0 text-[0.75rem] font-medium tabular-nums text-ut-muted">
                      {t.occurredAt}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[0.875rem] text-ut-text">{t.merchant}</span>
                    <span className="shrink-0 text-[0.8125rem] tabular-nums text-ut-text-2">
                      {t.category}
                      {trip && ` · ${trip.destination}`}
                      {t.categoryConfidence != null && t.categoryConfidence > 0 && ` · ${Math.round(t.categoryConfidence * 100)}%`}
                    </span>
                    <span className="shrink-0 text-[0.875rem] font-semibold tabular-nums text-ut-text">
                      {money(t.originalAmount ?? 0, t.originalCurrency)}
                    </span>
                  </div>
                );
              })}
              {result.fresh.length === 0 && (
                <p className="px-4 py-6 text-center text-[0.875rem] text-ut-text-2">
                  Nothing new to import — all rows are duplicates of your existing ledger.
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className={BTN_GHOST} onClick={() => setStep("mapping")}>
              Back
            </button>
            <button
              type="button"
              className={BTN_PRIMARY}
              onClick={commit}
              disabled={result.fresh.length === 0}
              style={result.fresh.length === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
            >
              Import {result.fresh.length} new transactions
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
