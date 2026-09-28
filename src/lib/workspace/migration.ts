/**
 * workspace/migration — 登录时的 guest → authenticated 数据迁移（单向、一次性、可重试）。
 *
 * 语义（与 guest.ts 的既有契约互补，不推翻「匿名草稿属于这台设备」的设计）：
 *  - 登录后第一次加载云端工作区时，若浏览器里存在未同步的匿名草稿（trips /
 *    saved / inbox / transactions / merchantRules），把它们**并入**云端工作区
 *    并通过既有 applyRemoteChanges 增量上传 —— 不新建第二条写入通道；
 *  - 同 ID（含此前已迁移过的行）→ 跳过，绝不重复创建；
 *  - 上传失败 → 抛出真实错误，调用方必须显式呈现，**不能假装成功**；
 *    失败时匿名数据原地保留（仍可登出后使用，也可重试迁移）。
 *
 * 这里刻意不做的：
 *  - 不清空/改写 localStorage 的 guest 副本（登出后仍可用是既有产品行为）；
 *  - 不迁移 activity 流水（纯展示噪音，且会让活动时间线出现不属于云端历史的条目）。
 */

import type { WorkspaceState } from "@/components/trips/workspace/types";
import { loadGuestWorkspace } from "./guest";
import { migrateWorkspaceState } from "@/components/trips/workspace/expenses/engine";

export interface GuestMigration {
  /** 并入后的完整云端工作区（已含 guest 数据） */
  merged: WorkspaceState;
  importedTrips: number;
  importedSaved: number;
  importedInbox: number;
  importedTransactions: number;
}

/** guest 副本里是否有任何值得迁移的内容（空壳不触发上传请求）。 */
function hasMigratableContent(guest: WorkspaceState): boolean {
  return (
    guest.trips.length > 0 ||
    guest.saved.length > 0 ||
    guest.inbox.length > 0 ||
    guest.transactions.length > 0 ||
    Object.keys(guest.merchantRules).length > 0
  );
}

/**
 * 把 guest 工作区并入云端工作区。
 * @returns null = 没有 guest 数据或没有可迁移内容（调用方走正常加载路径）。
 */
export function mergeGuestWorkspace(remote: WorkspaceState): GuestMigration | null {
  const guestRaw = loadGuestWorkspace();
  if (!guestRaw) return null;
  const guest = migrateWorkspaceState(guestRaw);
  if (!hasMigratableContent(guest)) return null;

  // 同 ID 去重：已迁移过（或恰巧同 ID）的行绝不重复创建。
  const remoteTripIds = new Set(remote.trips.map((t) => t.id));
  const remoteSavedIds = new Set(remote.saved.map((s) => s.id));
  const remoteInboxIds = new Set(remote.inbox.map((i) => i.id));
  const remoteTxnIds = new Set(remote.transactions.map((t) => t.id));

  const trips = guest.trips.filter((t) => !remoteTripIds.has(t.id));
  const saved = guest.saved.filter((s) => !remoteSavedIds.has(s.id));
  const inbox = guest.inbox.filter((i) => !remoteInboxIds.has(i.id));
  const transactions = guest.transactions.filter((t) => !remoteTxnIds.has(t.id));
  const merchantRules = { ...remote.merchantRules };
  let importedRules = 0;
  for (const [key, rule] of Object.entries(guest.merchantRules)) {
    if (merchantRules[key]) continue;
    merchantRules[key] = rule;
    importedRules += 1;
  }

  const importedTrips = trips.length;
  const importedSaved = saved.length;
  const importedInbox = inbox.length;
  const importedTransactions = transactions.length;
  if (
    importedTrips === 0 &&
    importedSaved === 0 &&
    importedInbox === 0 &&
    importedTransactions === 0 &&
    importedRules === 0
  ) {
    // guest 内容与云端完全重合（例如重复登录）：无事可做，但 guest 副本原样保留。
    return null;
  }

  return {
    merged: {
      ...remote,
      trips: [...remote.trips, ...trips],
      saved: [...remote.saved, ...saved],
      inbox: [...remote.inbox, ...inbox],
      transactions: [...remote.transactions, ...transactions],
      merchantRules,
    },
    importedTrips,
    importedSaved,
    importedInbox,
    importedTransactions,
  };
}
