"use client";

/**
 * ReceiptModal — "+ Add receipt"（spec #22）。
 *
 * 诚实边界：当前没有真实 OCR provider，因此不做"识别结果"的假声明——
 * 上传收据后，从文件名提取启发式线索（merchant / amount），
 * 金额 / 日期 / 商户由用户核对填写，保存后进入 Review 再确认。
 * 图片在客户端压缩为缩略图存储；PDF 仅存文件名。
 */

import { useRef, useState } from "react";
import type { Trip, WorkspaceAction } from "../types";
import type { NewTransaction } from "./types";
import { CURRENCIES, heuristicFromReceiptFilename, suggestTrip } from "./engine";
import { CategorySelect } from "./parts";
import { BTN_GHOST, BTN_PRIMARY, MONO_META, Modal } from "../ui";
import { localId } from "../logic";

const INPUT_CLS =
  "h-10 w-full rounded-xl border border-[#dfe5e4] bg-white px-3 text-[0.875rem] text-ut-text placeholder:text-[#9aa5a8] focus:border-ut-accent focus:outline-none";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 客户端压缩：最长边 1000px JPEG（质量 0.72）→ data URL；失败返回 null */
async function compressImage(file: File): Promise<string | null> {
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("decode failed"));
      image.src = dataUrl;
    });
    const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  } catch {
    return null;
  }
}

export default function ReceiptModal({
  trips,
  dispatch,
  onClose,
  presetTripId,
}: {
  trips: Trip[];
  dispatch: (action: WorkspaceAction) => void;
  onClose: () => void;
  presetTripId?: string;
}) {
  const [fileName, setFileName] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("THB");
  const [date, setDate] = useState(todayISO());
  const [tripId, setTripId] = useState(presetTripId ?? "");
  const [category, setCategory] = useState<NewTransaction["category"]>("food");
  const [subcategory, setSubcategory] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const amt = Number(amount);
  const amountValid = Number.isFinite(amt) && amt > 0;

  const onFile = async (file: File) => {
    setBusy(true);
    setFileName(file.name);
    const { merchantGuess, amountGuess } = heuristicFromReceiptFilename(file.name);
    setMerchant(merchantGuess);
    if (amountGuess) setAmount(String(amountGuess));
    if (file.type.startsWith("image/") || /\.(jpe?g|png|gif|webp)$/i.test(file.name)) {
      const compressed = await compressImage(file);
      setReceiptUrl(compressed ?? undefined);
    } else {
      setReceiptUrl(undefined);
    }
    setBusy(false);
  };

  const tripSuggestion =
    merchant.trim().length >= 2
      ? suggestTrip(date, merchant, fileName, currency, trips)
      : null;

  const submit = () => {
    if (!merchant.trim() || !amountValid || !date) return;
    const now = new Date().toISOString();
    const txn: NewTransaction = {
      source: "receipt",
      merchant: merchant.trim(),
      rawMerchant: fileName || undefined,
      occurredAt: date,
      originalAmount: amt,
      originalCurrency: currency,
      category,
      subcategory,
      categoryConfidence: 0, // 无真实 OCR → 必须经 Review 确认
      tripId: tripId || undefined,
      status: "needs_review",
      splitBetween: [],
      receiptUrl,
      receiptId: receiptUrl ? localId("r") : undefined,
    };
    dispatch({ type: "ADD_TXN", txn: { ...txn, id: localId("txn"), createdAt: now, updatedAt: now } });
    onClose();
  };

  return (
    <Modal title="Add receipt" onClose={onClose}>
      <div className="space-y-4">
        {/* 上传区 */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-[#dfe5e4] bg-[#f6f8f7] px-4 py-8 transition-colors hover:border-ut-accent"
        >
          <span className="text-[1.25rem]" aria-hidden="true">🧾</span>
          <span className="text-[0.875rem] font-semibold text-ut-ink">
            {fileName || busy ? (busy ? "Reading…" : fileName) : "Choose receipt"}
          </span>
          <span className="text-[0.75rem] text-ut-muted">JPG · PNG · PDF — stored locally</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
          }}
        />

        {receiptUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={receiptUrl}
            alt="Receipt preview"
            className="max-h-48 rounded-xl border border-[#eef1f0] object-contain"
          />
        )}

        {fileName && (
          <p className="rounded-full bg-[#fdf3e3] px-3 py-1.5 text-[0.75rem] font-semibold text-[#8a5a12]">
            Verify details below — the receipt goes through Review before entering your ledger.
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block sm:col-span-1">
            <span className={`mb-1.5 block ${MONO_META}`}>Merchant</span>
            <input className={INPUT_CLS} value={merchant} onChange={(e) => setMerchant(e.target.value)} />
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

        {tripSuggestion && !tripId && (
          <button
            type="button"
            onClick={() => setTripId(tripSuggestion.tripId)}
            className="cursor-pointer rounded-full bg-[#e0f3ea] px-3 py-1.5 text-[0.75rem] font-semibold text-[#0b6b47] transition-colors hover:bg-[#d0ecdf]"
          >
            Looks like {trips.find((t) => t.id === tripSuggestion.tripId)?.destination} ·{" "}
            {Math.round(tripSuggestion.confidence * 100)}% — assign
          </button>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={`mb-1.5 block ${MONO_META}`}>Date</span>
            <input className={INPUT_CLS} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="block">
            <span className={`mb-1.5 block ${MONO_META}`}>Trip</span>
            <select className={INPUT_CLS} value={tripId} onChange={(e) => setTripId(e.target.value)}>
              <option value="">Unassigned</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.destination}
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

        <div className="flex justify-end gap-2 border-t border-[#eef1f0] pt-4">
          <button type="button" className={BTN_GHOST} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={BTN_PRIMARY}
            onClick={submit}
            disabled={!fileName || !merchant.trim() || !amountValid || !date}
            style={!fileName || !merchant.trim() || !amountValid || !date ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
          >
            Add to review
          </button>
        </div>
      </div>
    </Modal>
  );
}
