"use client";

import { trackEvent } from "@/lib/analytics";

/**
 * TripsWorkspace — UTRIPLA 用户登录后的个人旅行后台（App Shell）。
 *
 * 第六轮：UI 1:1 参考 Stippl 后台（用户提供 stippl.io/home 截图）——
 * 浅灰绿 shell + 左浅色 sidebar + 白卡工作区 + emerald 胶囊按钮 + mint active；
 * 空态 = Stippl 式"圆形 mint 图标 + bold 标题 + 灰描述 + 绿胶囊 CTA"。
 *
 * 产品规则（第六轮，最高优先级）：
 *  - **默认完全为空**：无任何预置 Trip / 地点 / 酒店 / 费用 / 旅客 / inbox；
 *    一切内容来自用户自己的创建与保存（Trip 是用户创建的 container）；
 *  - Demo 数据与真实数据隔离：仅当用户显式点击 "Load demo data" 才加载；
 *  - 新 Trip 刚创建时为空 Trip（Places "No places yet" 等）。
 *
 * 状态：useReducer 是唯一的状态变更入口（`workspaceReducer`），持久化交给
 * `@/lib/workspace` 的两条通道——
 *  - 未登录：localStorage（这台设备）；
 *  - 已登录：Supabase（唯一 source of truth，按 auth.uid() 由 RLS 隔离）。
 * 两条通道之间没有任何自动搬运：匿名期间的草稿不会因为登录而被上传。
 */

import Link from "next/link";
import DestinationField, { type DestinationChoice } from "./DestinationField";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Image from "next/image";
import type { InboxItem, InboxKind, SavedItem, Trip, WorkspaceAction, WorkspaceState } from "./types";
import {
  formatSavedDate,
  formatTripDates,
  localId,
  money,
  nightsBetween,
  tripStage,
  workspaceReducer,
} from "./logic";
import { seedWorkspace } from "./seed";
import TripWorkspace from "./TripWorkspace";
import { CaptureLine } from "./inline";
import ExpensesWorkspace from "./expenses/ExpensesWorkspace";
import { tripActualTotals, migrateWorkspaceState } from "./expenses/engine";
import { reviewQueue } from "./expenses/engine";
import { BTN_GHOST, BTN_PRIMARY, EmptyState, INPUT, META_LINE, Modal, Panel, MONO_META, T_CARD, T_META, T_PAGE, T_SECTION, TOOLBAR_ACTION } from "./ui";
import { DESTINATIONS } from "@/data/destinations";
import { useSession } from "@/lib/use-session";
import {
  commitWorkspace,
  loadWorkspace,
  modeKey,
  type WorkspaceMode,
} from "@/lib/workspace";

type View =
  | { name: "trips" }
  | { name: "trip"; tripId: string }
  | { name: "saved" }
  | { name: "inbox" }
  | { name: "expenses" }
  | { name: "account" };

const NAV_MAIN = [
  { key: "trips", label: "Trips", icon: "🗺️" },
  { key: "saved", label: "Saved", icon: "🔖" },
  { key: "inbox", label: "Inbox", icon: "📥" },
  { key: "expenses", label: "Expenses", icon: "¥" },
] as const;

/** 目的地小缩略图（识别用途） */
function destinationImage(destination: string): string | null {
  const dest = DESTINATIONS.find((d) => d.city.toLowerCase() === destination.toLowerCase());
  return dest?.image ?? null;
}

/** 同步错误的可读描述（保留表名/操作，便于定位是哪一层拒绝的写入）。 */
function describeSyncError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Unexpected error while saving.";
}

export default function TripsWorkspace() {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, seedWorkspace);
  const [view, setView] = useState<View>({ name: "trips" });
  const [newTripOpen, setNewTripOpen] = useState(false);
  const { userId, ready: sessionReady } = useSession();

  /**
   * 数据基线 = **上一次成功落盘的状态**，并且与它所属的身份绑在一起。
   *
   * 身份必须和状态同存：只存状态的话，切换账号的瞬间会用 A 的数据算出增量、
   * 打到 B 的账号上（userId 决定命名空间与 RLS 作用域，写错就是真实泄漏）。
   * 因此每次写入用的 mode 都取自基线自身，而不是当前渲染的 session。
   *
   * 失败时基线**不推进** —— 下一次提交会从同一个基线重新算出同一份增量并重试。
   * 这是「不出现假成功」的落地点：界面可以乐观，基线不会说谎。
   */
  const baselineRef = useRef<{
    identity: string;
    mode: WorkspaceMode;
    state: WorkspaceState;
  } | null>(null);
  const latestStateRef = useRef(state);
  const loadSeqRef = useRef(0);
  const commitChainRef = useRef<Promise<void>>(Promise.resolve());
  const drainingRef = useRef(false);
  const dirtyRef = useRef(false);

  /**
   * 加载结果的**事实记录**（identity + 是否失败），不是命令式的 phase 变量。
   *
   * phase 是派生的：`已加载的身份 !== 当前身份` 就是 loading，因此身份一变
   * 立刻回到 loading，不需要在 effect 里同步 setState 去"改状态" ——
   * 那样会触发级联渲染，也会让"正在加载"和"加载完了"两个事实分家。
   */
  const [loadResult, setLoadResult] = useState<{ identity: string; error: string | null } | null>(
    null,
  );
  const [writeError, setWriteError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  // 当前身份（由会话推导，不落 state）：null = 会话还没解析完
  const activeIdentity = !sessionReady
    ? null
    : modeKey(userId ? { kind: "remote", userId } : { kind: "guest" });

  const syncPhase: "loading" | "ready" | "error" =
    activeIdentity === null || loadResult?.identity !== activeIdentity
      ? "loading"
      : loadResult.error
        ? "error"
        : "ready";

  const syncError = syncPhase === "error" ? (loadResult?.error ?? null) : writeError;

  // ── 读：由身份（不是挂载）决定数据来源 ─────────────────────────────
  useEffect(() => {
    if (!sessionReady) return;
    const mode: WorkspaceMode = userId ? { kind: "remote", userId } : { kind: "guest" };
    const identity = modeKey(mode);
    const seq = ++loadSeqRef.current;

    // 身份切换的第一件事：让旧基线立即失效。此后任何在途提交都读不到基线，
    // 也就不会把上一个账号的数据写到新账号下。（ref 写入不引起渲染。）
    baselineRef.current = null;
    dirtyRef.current = false;

    void (async () => {
      try {
        const loadedState = await loadWorkspace(mode);
        if (seq !== loadSeqRef.current) return; // 更新的加载已开始 → 丢弃这次结果
        baselineRef.current = {
          identity,
          mode,
          // 与 reducer 的 RESTORE_STATE 用同一个迁移函数：两边结果深度相等，
          // 因此「加载完成」本身不会产生任何写入（空增量 = 零请求）。
          state: migrateWorkspaceState(loadedState),
        };
        dispatch({ type: "RESTORE_STATE", state: loadedState });
        setView({ name: "trips" });
        setWriteError(null);
        setLoadResult({ identity, error: null });
      } catch (error) {
        if (seq !== loadSeqRef.current) return;
        setLoadResult({ identity, error: describeSyncError(error) });
      }
    })();
  }, [sessionReady, userId, reloadNonce]);

  /**
   * 串行排空待写增量：同一时刻只有一个写入序列在跑，避免两次快速改动互相穿插
   * （逐行 upsert 的顺序会决定外键是否已存在）。
   *
   * 循环在每次迭代重新读取「最新基线 + 最新状态」，因此循环期间到达的新改动
   * 会被顺带写完，不需要额外排队；`dirtyRef` 负责消灭「刚好在退出前到达」的
   * 那次改动造成的丢写窗口。
   */
  const drain = useCallback(() => {
    if (drainingRef.current) return;
    drainingRef.current = true;
    commitChainRef.current = commitChainRef.current.then(async () => {
      try {
        while (dirtyRef.current) {
          dirtyRef.current = false;
          const base = baselineRef.current;
          const current = latestStateRef.current;
          if (!base || base.state === current) continue;
          // 写入用的 mode 取自基线自身（而非当前渲染的 session）：
          // 身份与数据永远不可能错配。
          await commitWorkspace(base.mode, base.state, current);
          baselineRef.current = { identity: base.identity, mode: base.mode, state: current };
          setWriteError(null);
        }
      } catch (error) {
        dirtyRef.current = false;
        setWriteError(describeSyncError(error));
      } finally {
        drainingRef.current = false;
      }
    });
  }, []);

  // 状态变化 → 标记待写并（若空闲）开始排空
  useEffect(() => {
    latestStateRef.current = state;
    if (syncPhase !== "ready") return;
    dirtyRef.current = true;
    drain();
  }, [state, syncPhase, drain]);

  const retrySync = useCallback(() => {
    if (syncPhase === "error") {
      setReloadNonce((n) => n + 1);
      return;
    }
    dirtyRef.current = true;
    setWriteError(null);
    drain();
  }, [drain, syncPhase]);

  const activeNav =
    view.name === "trip" ? "trips" : view.name === "account" ? "account" : view.name;

  // Review 是第一类工作流：有待审核交易时，sidebar Expenses 必须显示 badge（spec #50）
  const reviewCount = reviewQueue(state.transactions).length;

  const rightPane = (() => {
    // 加载中：不渲染空态又立刻替换（会让人误以为数据丢了）
    if (syncPhase === "loading") {
      return (
        <Panel className="mt-6">
          <p className="px-6 py-14 text-center text-[0.875rem] text-ut-muted">
            {sessionReady && userId ? "Loading your trips…" : "Loading your workspace…"}
          </p>
        </Panel>
      );
    }
    // 加载失败：没有可信基线，任何写入都可能覆盖真实数据 → 阻断并只提供重试
    if (syncPhase === "error") {
      return (
        <Panel className="mt-6">
          <EmptyState
            icon="⚠️"
            title="Couldn't load your workspace"
            description={syncError ?? "The workspace could not be loaded."}
            action={
              <button type="button" className={BTN_PRIMARY} onClick={retrySync}>
                Try again
              </button>
            }
          />
        </Panel>
      );
    }
    if (view.name === "trip") {
      const trip = state.trips.find((t) => t.id === view.tripId);
      if (trip) {
        return (
          <TripWorkspace
            trip={trip}
            dispatch={dispatch}
            activity={state.activity}
            transactions={state.transactions}
            merchantRules={state.merchantRules}
            onBack={() => setView({ name: "trips" })}
          />
        );
      }
    }
    if (view.name === "saved")
      return <SavedView saved={state.saved} trips={state.trips} dispatch={dispatch} />;
    if (view.name === "inbox")
      return <InboxView inbox={state.inbox} trips={state.trips} dispatch={dispatch} />;
    if (view.name === "expenses")
      return (
        <ExpensesWorkspace
          state={state}
          dispatch={dispatch}
          onOpenTrip={(id) => setView({ name: "trip", tripId: id })}
        />
      );
    if (view.name === "account") return <AccountView />;
    return (
      <TripsListView
        state={state}
        dispatch={dispatch}
        newTripOpen={newTripOpen}
        setNewTripOpen={setNewTripOpen}
        onOpenTrip={(id) => setView({ name: "trip", tripId: id })}
      />
    );
  })();

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 pb-20 pt-8 md:px-6">
      {/* ═══ 左侧：个人导航（Stippl sidebar） ═══ */}
      <aside className="sticky top-24 hidden h-fit w-60 shrink-0 md:block">
        <p className="text-[1.25rem] font-bold tracking-[-0.02em] text-ut-accent">tripla</p>

        <nav aria-label="Workspace" className="mt-6">
          <ul className="space-y-1">
            {NAV_MAIN.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => setView({ name: item.key } as View)}
                  aria-current={activeNav === item.key ? "page" : undefined}
                  className={`flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-full px-4 text-left text-[0.875rem] transition-colors ${
                    activeNav === item.key
                      ? "bg-[#e0f3ea] font-semibold text-[#0b6b47]"
                      : "text-ut-text-2 hover:bg-[#eef3f0] hover:text-ut-ink"
                  }`}
                >
                  <span aria-hidden="true" className="w-4 text-center text-[0.8rem]">
                    {item.icon}
                  </span>
                  {item.label}
                  {item.key === "expenses" && reviewCount > 0 && (
                    <span className="ml-auto rounded-full bg-[#8a5a12] px-1.5 py-0.5 text-[0.625rem] font-bold text-white">
                      {reviewCount}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* 账号 chip：读真实会话（Supabase Auth），点击进入 Account 视图 */}
        <AccountChip active={activeNav === "account"} onClick={() => setView({ name: "account" })} />
      </aside>

      {/* ═══ 右侧：工作区 ═══ */}
      <main className="min-w-0 flex-1">
        {/* 移动端：横向轻导航（Stippl 无此态，保持简洁胶囊） */}
        <nav aria-label="Workspace sections" className="mb-6 flex gap-2 overflow-x-auto md:hidden">
          {NAV_MAIN.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setView({ name: item.key } as View)}
              aria-current={activeNav === item.key ? "page" : undefined}
              className={`inline-flex h-9 shrink-0 cursor-pointer items-center rounded-full px-4 text-[0.8125rem] font-semibold transition-colors ${
                activeNav === item.key
                  ? "bg-[#e0f3ea] text-[#0b6b47]"
                  : "border border-[#dfe5e4] bg-white text-ut-text-2"
              }`}
            >
              {item.label}
              {item.key === "expenses" && reviewCount > 0 && (
                <span className="ml-1.5 rounded-full bg-[#8a5a12] px-1.5 py-0.5 text-[0.625rem] font-bold text-white">
                  {reviewCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        {/* 写入失败：本地改动仍在内存里（乐观），但**必须**告诉用户它还没落盘。
            刻意不做自动回滚 —— 回滚会丢掉用户刚输入的内容；这里保持界面与
            「基线未推进」一致，下一次改动或点 Retry 会重试同一份增量。 */}
        {syncPhase === "ready" && syncError && (
          <div
            role="alert"
            className="mb-5 flex flex-wrap items-start gap-x-4 gap-y-2 rounded-ut-md border border-[#e8c9c6] bg-[#fdf5f4] px-4 py-3"
          >
            <p className="min-w-0 flex-1 text-[0.8125rem] leading-relaxed text-[#8a2f28]">
              <span className="font-semibold">Not saved to your account yet.</span>{" "}
              {syncError}
            </p>
            <button
              type="button"
              onClick={retrySync}
              className="shrink-0 cursor-pointer text-[0.8125rem] font-semibold text-[#8a2f28] underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              Retry
            </button>
          </div>
        )}
        {rightPane}
      </main>
    </div>
  );
}

// ── View：My Trips（首页工作列表） ────────────────────────────────────

function TripsListView({
  state,
  dispatch,
  newTripOpen,
  setNewTripOpen,
  onOpenTrip,
}: {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  newTripOpen: boolean;
  setNewTripOpen: (v: boolean) => void;
  onOpenTrip: (tripId: string) => void;
}) {
  const current = state.trips.filter((t) => t.status === "current");
  const upcoming = state.trips.filter((t) => t.status === "upcoming");
  const past = state.trips.filter((t) => t.status === "past");

  return (
    <div>
      {/* ── 头部：标题 + 创建入口（空列表时唯一入口交给空态，避免同屏两个 CTA） ── */}
      <div className="flex items-center justify-between gap-4">
        <h1 className={T_PAGE}>My trips</h1>
        {state.trips.length > 0 && (
          <button type="button" className={BTN_PRIMARY} onClick={() => setNewTripOpen(true)}>
            + New trip
          </button>
        )}
      </div>

      {newTripOpen && (
        <Modal title="Create a trip" onClose={() => setNewTripOpen(false)}>
          <NewTripForm
            dispatch={dispatch}
            onCreated={(tripId) => {
              trackEvent({ name: "trip_create", authenticated: true, source: "trips_workspace" });
              setNewTripOpen(false);
              onOpenTrip(tripId);
            }}
            onCancel={() => setNewTripOpen(false)}
          />
        </Modal>
      )}

      {state.trips.length === 0 && !newTripOpen ? (
        <>
          {/* ── 空态（蓝图 #4：不只 "No trips yet"，要告诉用户这个 App 能干什么） ── */}
          <Panel className="mt-6">
            <EmptyState
              icon="🧭"
              title="No trips yet"
              description="Create a trip and keep everything in one place."
              action={
                <>
                  <button type="button" className={BTN_PRIMARY} onClick={() => setNewTripOpen(true)}>
                    + New trip
                  </button>
                  <Link className={BTN_GHOST} href="/destinations">
                    Browse destinations
                  </Link>
                </>
              }
            />
            <div className="mt-2 flex flex-wrap justify-center gap-2 px-6 pb-2">
              {["Places", "Itinerary", "Stay", "Expenses", "Travelers", "Checklist"].map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-[#e8ecec] bg-[#f6f8f7] px-3.5 py-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ut-text-2"
                >
                  {f}
                </span>
              ))}
            </div>
          </Panel>
          <p className="mt-4 text-center text-[0.75rem] text-ut-muted">
            Just exploring?{" "}
            <button
              type="button"
              className="cursor-pointer font-semibold text-ut-accent hover:text-ut-accent-strong"
              onClick={() => {
                if (window.confirm("Load demo data? This replaces the current workspace content.")) {
                  dispatch({ type: "LOAD_DEMO" });
                }
              }}
            >
              Load demo data
            </button>
          </p>
        </>
      ) : (
        <>
          {/* Travel activity（蓝图 #23：一小行，非 KPI Wall） */}
          <p className={`mt-5 ${META_LINE}`}>
            {state.saved.length} saved {state.saved.length === 1 ? "item" : "items"} · {state.trips.length}{" "}
            {state.trips.length === 1 ? "trip" : "trips"} · {state.inbox.length} to review
          </p>

          {current.length > 0 && (
            <TripGroup label="Current" trips={current} transactions={state.transactions} onOpenTrip={onOpenTrip} dispatch={dispatch} />
          )}
          {upcoming.length > 0 && (
            <TripGroup label="Upcoming" trips={upcoming} transactions={state.transactions} onOpenTrip={onOpenTrip} dispatch={dispatch} />
          )}
          {past.length > 0 && (
            <TripGroup label="Past" trips={past} transactions={state.transactions} onOpenTrip={onOpenTrip} dispatch={dispatch} />
          )}

          {/* Recent activity（蓝图 #3：真实操作流水） */}
          {state.activity.length > 0 && (
            <section className="mt-10">
              <p className={`mb-3 ${T_SECTION}`}>Recent activity</p>
              <Panel className="divide-y divide-[#eef1f0]">
                {state.activity.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-baseline gap-4 px-5 py-3">
                    <span className="min-w-0 flex-1 truncate text-body-sm text-ut-text-2">{a.text}</span>
                    <span className="shrink-0 text-[0.6875rem] font-medium tracking-[0.03em] text-[#8a969a]">
                      {a.at}
                    </span>
                  </div>
                ))}
              </Panel>
            </section>
          )}

          {/* 有数据时也提供清空 / demo 入口（显式、confirm 保护） */}
          <p className="mt-10 text-center text-[0.75rem] text-ut-muted">
            Want a clean slate?{" "}
            <button
              type="button"
              className="cursor-pointer font-semibold text-ut-accent hover:text-ut-accent-strong"
              onClick={() => {
                // 清空 = dispatch RESET，由数据层按通道落盘：匿名写空状态回
                // localStorage，登录用户则由增量 diff 删掉云端对应行。
                // 不在这里直接 removeItem —— 那样会与随后的写入互相打脸。
                if (
                  window.confirm(
                    "Clear the workspace? All trips, saves, expenses and checklist items will be deleted.",
                  )
                ) {
                  dispatch({ type: "RESET" });
                }
              }}
            >
              Clear workspace
            </button>{" "}
            ·{" "}
            <button
              type="button"
              className="cursor-pointer font-semibold text-ut-accent hover:text-ut-accent-strong"
              onClick={() => {
                if (window.confirm("Load demo data? This replaces the current workspace content.")) {
                  dispatch({ type: "LOAD_DEMO" });
                }
              }}
            >
              Load demo data
            </button>
          </p>
        </>
      )}
    </div>
  );
}

function TripGroup({
  label,
  trips,
  transactions,
  onOpenTrip,
  dispatch,
}: {
  label: string;
  trips: Trip[];
  transactions: WorkspaceState["transactions"];
  onOpenTrip: (tripId: string) => void;
  dispatch: (action: WorkspaceAction) => void;
}) {
  return (
    <section className="mt-8">
      <p className={`mb-3 ${T_SECTION}`}>
        {label}
        <span className="ml-2 text-[#9aa5a8]">{trips.length}</span>
      </p>
      <div className="grid gap-3">
        {trips.map((trip) => (
          <TripRow
            key={trip.id}
            trip={trip}
            transactions={transactions}
            image={destinationImage(trip.destination)}
            onOpen={() => onOpenTrip(trip.id)}
            onDelete={() => {
              if (window.confirm(`Delete "${trip.destination}" trip? This cannot be undone.`)) {
                dispatch({ type: "DELETE_TRIP", tripId: trip.id });
              }
            }}
          />
        ))}
      </div>
    </section>
  );
}

/** Trip 卡内的单个状态格（蓝图 #3） */
function TripStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.625rem] font-medium uppercase tracking-[0.1em] text-[#8a969a]">{label}</p>
      <p className="mt-0.5 text-[0.8125rem] font-semibold tabular-nums text-ut-text">{value}</p>
    </div>
  );
}

/** Trip 工作记录行：一条用户自己的数据（白卡） */
function TripRow({
  trip,
  transactions,
  image,
  onOpen,
  onDelete,
}: {
  trip: Trip;
  transactions: WorkspaceState["transactions"];
  image: string | null;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const confirmedTxnCount = transactions.filter(
    (t) => t.tripId === trip.id && t.status === "confirmed",
  ).length;
  const stage = tripStage(trip, confirmedTxnCount);
  const nights = nightsBetween(trip.startDate, trip.endDate);
  const places = trip.places.filter((p) => p.status === "want" || p.status === "must").length;
  const progressLabel = stage;
  const expensesStat = tripActualTotals(transactions, trip.id)[0];

  return (
    <div className="group flex items-start gap-4 rounded-2xl border border-[#e8ecec] bg-white p-5 transition-colors hover:border-[#d7dedd]">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${trip.destination} trip`}
        className="relative hidden h-14 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl sm:block"
      >
        {image ? (
          <Image src={image} alt="" fill sizes="80px" className="object-cover" />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(10,165,108,0.35) 0%, rgba(23,36,42,0.88) 100%)",
            }}
          />
        )}
      </button>

      <button type="button" onClick={onOpen} className="min-w-0 flex-1 cursor-pointer text-left">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <p className={`transition-colors group-hover:text-ut-accent ${T_CARD}`}>
            {trip.destination}
          </p>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold ${
              stage === "Ready"
                ? "bg-[#e0f3ea] text-[#0b6b47]"
                : stage === "In progress"
                  ? "bg-[#fdf3e3] text-[#8a5a12]"
                  : "bg-[#f0f2f1] text-ut-muted"
            }`}
          >
            {progressLabel}
          </span>
        </div>
        <p className={`mt-0.5 ${META_LINE}`}>
          {formatTripDates(trip.startDate, trip.endDate)} ·{" "}
          {trip.travelers.length === 1 ? "1 traveler" : `${trip.travelers.length} travelers`} · {nights}{" "}
          {nights === 1 ? "night" : "nights"}
        </p>
        {/* 六格状态（蓝图 #3：Places / Itinerary / Stay / Expenses / People / Checklist） */}
        <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-2 border-t border-[#eef1f0] pt-3 sm:grid-cols-6">
          <TripStat label="Places" value={String(places)} />
          <TripStat label="Itinerary" value={`${trip.routeDays.length} ${trip.routeDays.length === 1 ? "day" : "days"}`} />
          <TripStat
            label="Stay"
            value={trip.hotels.some((h) => h.booked) ? `${trip.hotels.length} · booked` : String(trip.hotels.length)}
          />
          <TripStat
            label="Expenses"
            value={expensesStat ? money(expensesStat.amount, expensesStat.currency) : money(0, trip.currency)}
          />
          <TripStat label="People" value={String(trip.travelers.length)} />
          <TripStat
            label="Checklist"
            value={
              trip.checklist.length === 0
                ? "0"
                : `${trip.checklist.filter((c) => !c.done).length} open`
            }
          />
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <button type="button" className={BTN_PRIMARY} onClick={onOpen}>
          Open trip
        </button>
        <button
          type="button"
          aria-label={`Delete ${trip.destination} trip`}
          title="Delete trip"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#dfe5e4] bg-white text-[0.8rem] text-[#8a969a] transition-colors hover:border-[#e6b9b6] hover:bg-[#fdf3f2] hover:text-[#c4453d]"
          onClick={() => {
            if (window.confirm(`Delete "${trip.destination}" trip? This cannot be undone.`)) {
              onDelete();
            }
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ── View：Saved（蓝图 #11/21：用户自己的收藏库，独立存储） ────────────

const KIND_LABEL: Record<InboxKind, string> = {
  place: "Place",
  hotel: "Hotel",
  activity: "Activity",
  guide: "Guide",
};

function SavedView({
  saved,
  trips,
  dispatch,
}: {
  saved: SavedItem[];
  trips: Trip[];
  dispatch: (action: WorkspaceAction) => void;
}) {
  const [filter, setFilter] = useState<InboxKind | "all">("all");
  const [tripChoice, setTripChoice] = useState<Record<string, string>>({});

  const shown = filter === "all" ? saved : saved.filter((s) => s.kind === filter);

  /** 捕获行：写一句 → 默认 Place 类型入库（类型/备注之后整理，spec #18） */
  const capture = (text: string) => {
    const title = text.trim();
    if (!title) return;
    dispatch({
      type: "ADD_SAVED",
      item: { kind: "place", title, savedAt: new Date().toISOString() },
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex flex-wrap items-baseline gap-x-4">
          <h1 className={T_PAGE}>Saved</h1>
          <p className={META_LINE}>
            {saved.length} {saved.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {saved.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {(["all", "place", "hotel", "activity", "guide"] as const).map((k) => {
            const count = k === "all" ? saved.length : saved.filter((s) => s.kind === k).length;
            if (k !== "all" && count === 0) return null;
            return (
              <button
                key={k}
                type="button"
                aria-current={filter === k ? "true" : undefined}
                onClick={() => setFilter(k)}
                className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-ut-pill border px-4 text-[0.6875rem] font-medium uppercase tracking-[0.1em] transition-colors ${
                  filter === k
                    ? "border-ut-accent bg-[#e0f3ea] text-[#0b6b47]"
                    : "border-[#e8ecec] bg-[#f6f8f7] text-ut-text-2 hover:border-[#c6d0ce] hover:text-ut-ink"
                }`}
              >
                {k === "all" ? "All" : `${KIND_LABEL[k]}s`}
                <span className={filter === k ? "text-ut-text" : "text-[#8a969a]"}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {shown.length === 0 ? (
        <Panel className="mt-6">
          <p className="px-5 pt-5 text-[0.75rem] text-ut-muted">Start typing below.</p>
          <CaptureLine placeholder="Write something...  e.g. Senso-ji" onSubmit={capture} />
        </Panel>
      ) : (
        <div className="mt-6 divide-y divide-[#eef1f0] rounded-2xl border border-[#e8ecec] bg-white">
          {/* db 表头（spec #18：Type / Name / Saved / Trips） */}
          <div className="grid grid-cols-[5rem_minmax(0,1fr)_6rem_minmax(10rem,auto)_minmax(4rem,auto)] items-center gap-x-3 px-4 pt-3 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ut-muted md:px-5">
            <span>Type</span>
            <span>Name</span>
            <span>Saved</span>
            <span>Trips</span>
            <span aria-hidden="true" />
          </div>
          {shown.map((item) => {
            const chosen = tripChoice[item.id] ?? trips[0]?.id ?? "";
            return (
              <div
                key={item.id}
                className="group grid grid-cols-[5rem_minmax(0,1fr)_6rem_minmax(10rem,auto)_minmax(4rem,auto)] items-center gap-x-3 px-4 py-2.5 md:px-5"
              >
                <span className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ut-muted">
                  {KIND_LABEL[item.kind]}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.875rem] font-medium text-ut-ink">
                    {item.title}
                    {(item.tripIds?.length ?? 0) > 0 && (
                      <span className="ml-2 text-[0.6875rem] font-medium text-[#0b6b47]">
                        ✓ {(item.tripIds ?? [])
                          .map((id) => trips.find((t) => t.id === id)?.destination)
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                  </span>
                  {item.meta && <span className={`block truncate text-[0.75rem] text-ut-muted`}>{item.meta}</span>}
                </span>
                <span className="text-[0.75rem] text-ut-muted">{formatSavedDate(item.savedAt)}</span>
                <span className="flex min-w-0 items-center gap-2">
                  {trips.length > 0 && (
                    <>
                      <select
                        className="h-7 min-w-0 max-w-28 cursor-pointer rounded-lg border border-[#e3e8e7] bg-white px-2 text-[0.75rem] font-medium text-ut-text-2 focus:outline-none"
                        value={chosen}
                        onChange={(e) => setTripChoice((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        aria-label={`Target trip for ${item.title}`}
                      >
                        {trips.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.destination}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className={TOOLBAR_ACTION}
                        onClick={() => dispatch({ type: "SAVED_ADD_TO_TRIP", itemId: item.id, tripId: chosen })}
                      >
                        Add
                      </button>
                    </>
                  )}
                </span>
                <span className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label={`Remove ${item.title}`}
                    className="cursor-pointer text-[0.6875rem] font-medium text-[#8a969a] transition-colors hover:text-[#c4453d]"
                    onClick={() => dispatch({ type: "REMOVE_SAVED", itemId: item.id })}
                  >
                    Remove
                  </button>
                </span>
              </div>
            );
          })}
          <CaptureLine placeholder="Write something...  e.g. Senso-ji" onSubmit={capture} />
        </div>
      )}
    </div>
  );
}

// ── View：Inbox（蓝图 #12/22：待整理工作队列） ────────────────────────

function InboxView({
  inbox,
  trips,
  dispatch,
}: {
  inbox: InboxItem[];
  trips: Trip[];
  dispatch: (action: WorkspaceAction) => void;
}) {
  const [tripChoice, setTripChoice] = useState<Record<string, string>>({});

  /** 捕获行：写一句 → 入工作队列（类型之后整理，spec #20） */
  const capture = (text: string) => {
    const title = text.trim();
    if (!title) return;
    dispatch({
      type: "ADD_INBOX_ITEM",
      item: { kind: "place", title, meta: "Added manually", savedAt: new Date().toISOString() },
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex flex-wrap items-baseline gap-x-4">
          <h1 className={T_PAGE}>Inbox</h1>
          <p className={META_LINE}>
            {inbox.length} {inbox.length === 1 ? "item" : "items"} to organize
          </p>
        </div>
      </div>

      {inbox.length === 0 ? (
        <Panel className="mt-6">
          <p className="px-5 pt-5 text-[0.75rem] text-ut-muted">Start typing below.</p>
          <CaptureLine placeholder="Write something...  e.g. Fuji day trip" onSubmit={capture} />
        </Panel>
      ) : (
        <>
          <div className="mt-6 divide-y divide-[#eef1f0] rounded-2xl border border-[#e8ecec] bg-white">
            {/* db 表头（spec #20：Item / Type / Saved / Action） */}
            <div className="grid grid-cols-[minmax(0,1fr)_5rem_6rem_minmax(14rem,auto)] items-center gap-x-3 px-4 pt-3 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ut-muted md:px-5">
              <span>Item</span>
              <span>Type</span>
              <span>Saved</span>
              <span>Actions</span>
            </div>
            {inbox.map((item) => {
              const chosen = tripChoice[item.id] ?? trips[0]?.id ?? "";
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[minmax(0,1fr)_5rem_6rem_minmax(14rem,auto)] items-center gap-x-3 px-4 py-2.5 md:px-5"
                >
                  <span className="block truncate text-[0.875rem] font-medium text-ut-ink">
                    {item.title}
                    {item.meta && item.meta !== "Added manually" && (
                      <span className="ml-2 text-[0.75rem] font-normal text-ut-muted">{item.meta}</span>
                    )}
                  </span>
                  <span className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ut-muted">
                    {KIND_LABEL[item.kind]}
                  </span>
                  <span className="text-[0.75rem] text-ut-muted">{formatSavedDate(item.savedAt)}</span>
                  <span className="flex min-w-0 flex-wrap items-center gap-2.5">
                    {trips.length > 0 && (
                      <>
                        <select
                          className="h-7 min-w-0 max-w-28 cursor-pointer rounded-lg border border-[#e3e8e7] bg-white px-2 text-[0.75rem] font-medium text-ut-text-2 focus:outline-none"
                          value={chosen}
                          onChange={(e) => setTripChoice((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          aria-label={`Target trip for ${item.title}`}
                        >
                          {trips.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.destination}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className={TOOLBAR_ACTION}
                          onClick={() => dispatch({ type: "INBOX_ADD_TO_TRIP", itemId: item.id, tripId: chosen })}
                        >
                          Add
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className={TOOLBAR_ACTION}
                      onClick={() => dispatch({ type: "INBOX_SAVE", itemId: item.id })}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer text-[0.75rem] font-medium text-ut-text-2 transition-colors hover:text-[#c4453d]"
                      onClick={() => dispatch({ type: "INBOX_IGNORE", itemId: item.id })}
                    >
                      Delete
                    </button>
                  </span>
                </div>
              );
            })}
            <CaptureLine placeholder="Write something...  e.g. Fuji day trip" onSubmit={capture} />
          </div>
        </>
      )}
    </div>
  );
}

// ── 账号 chip（侧栏身份位：读真实会话，可点击进入 Account） ──────────

function AccountChip({ active, onClick }: { active: boolean; onClick: () => void }) {
  const { email, ready } = useSession();
  const label = !ready ? "Checking…" : (email ?? "Guest");
  const meta = !ready ? "Checking session" : email ? "Signed in" : "Not signed in";

  return (
    <div
      className={`mt-8 rounded-2xl border p-3 transition-colors ${
        active ? "border-[#bcdccd] bg-[#f2f9f5]" : "border-[#e8ecec] bg-white"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className="flex w-full cursor-pointer items-center gap-2.5 text-left"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e0f3ea] text-[0.8rem] font-bold text-[#0b6b47]"
        >
          {email ? email.slice(0, 1).toUpperCase() : "👤"}
        </span>
        <span className="min-w-0">
          <span
            className="block truncate text-[0.8125rem] font-semibold text-ut-ink"
            title={email ?? undefined}
          >
            {label}
          </span>
          <span className="block text-[0.6875rem] text-ut-muted">{meta}</span>
        </span>
      </button>

      {ready && !email && (
        <Link
          href="/login"
          className="mt-2.5 block text-center text-[0.75rem] font-semibold text-[#0b6b47] transition-opacity hover:opacity-70"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}

// ── View：Account（真实会话；账号资料同步尚未开放，如实说明） ────────

function AccountView() {
  const { email, ready, busy, signOut } = useSession();

  return (
    <div>
      <h1 className={T_PAGE}>Account</h1>
      <Panel className="mt-6">
        {!ready ? (
          <p className="px-6 py-10 text-center text-[0.875rem] text-ut-muted">
            Checking your session…
          </p>
        ) : email ? (
          <div className="p-6">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e0f3ea] text-[1rem] font-bold text-[#0b6b47]"
              >
                {email.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span
                  className="block truncate text-[0.9375rem] font-semibold text-ut-ink"
                  title={email}
                >
                  {email}
                </span>
                <span className="block text-[0.75rem] text-ut-muted">Signed in</span>
              </span>
            </div>

            <p className={`mt-5 ${T_META}`}>
              Your trips, saved places, expenses and inbox are stored in this browser on this device.
            </p>

            <div className="mt-5">
              <button type="button" className={BTN_GHOST} onClick={signOut} disabled={busy}>
                {busy ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        ) : (
          <EmptyState
            title="You are not signed in"
            description="Sign in to reach your account, or keep planning as a guest — your trips stay in this browser on this device."
            action={
              <>
                <Link className={BTN_PRIMARY} href="/login">
                  Sign in
                </Link>
                <Link className={BTN_GHOST} href="/register">
                  Create account
                </Link>
              </>
            }
          />
        )}
      </Panel>
    </div>
  );
}

// ── New Trip 表单 ────────────────────────────────────────────────────

function NewTripForm({
  dispatch,
  onCreated,
  onCancel,
}: {
  dispatch: (action: WorkspaceAction) => void;
  onCreated: (tripId: string) => void;
  onCancel: () => void;
}) {
  const [dest, setDest] = useState<DestinationChoice | null>(null);
  const [tripName, setTripName] = useState("");
  const [currency, setCurrency] = useState("CNY");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const submit = () => {
    // 蓝图 #7：只允许从真实 Destination 创建（destinationId 必填）
    if (!dest || !startDate || !endDate) return;
    const tripId = localId("trip");
    dispatch({
      type: "CREATE_TRIP",
      id: tripId,
      destination: dest.name,
      destinationId: dest.id,
      startDate,
      endDate,
      travelers: 1,
      name: tripName.trim() || undefined,
      currency,
    });
    onCreated(tripId);
  };

  return (
    <div>
      <div className="grid gap-4">
        <div className="block">
          <span className={`mb-1.5 block ${T_META}`}>Destination</span>
          <DestinationField value={dest} onChange={setDest} />
        </div>
        <label className="block">
          <span className={`mb-1.5 block ${MONO_META}`}>Trip name (optional)</span>
          <input
            className={INPUT}
            placeholder="e.g. Golden Week"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={`mb-1.5 block ${MONO_META}`}>Start</span>
            <input className={INPUT} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label className="block">
            <span className={`mb-1.5 block ${MONO_META}`}>End</span>
            <input className={INPUT} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={`mb-1.5 block ${MONO_META}`}>Currency</span>
            <select className={INPUT} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="CNY">¥ CNY</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
              <option value="THB">฿ THB</option>
              <option value="JPY">¥ JPY</option>
            </select>
          </label>
          <div>
            <span className={`mb-1.5 block ${MONO_META}`}>Travelers</span>
            <p className="flex h-11 items-center rounded-ut-sm border border-[#e3e8e7] bg-[#f6f8f7] px-3 text-[0.875rem] text-ut-text">
              You
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 flex gap-2.5">
        <button
          type="button"
          className={BTN_PRIMARY}
          onClick={submit}
          disabled={!dest}
          style={dest ? undefined : { opacity: 0.5, cursor: "not-allowed" }}
        >
          Create trip
        </button>
        <button type="button" className={BTN_GHOST} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
