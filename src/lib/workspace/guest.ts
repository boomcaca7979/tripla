/**
 * workspace/guest — 匿名访客通道（localStorage）。
 *
 * 契约：
 *  - 只有这一条通道，匿名数据永远留在浏览器里；没有任何代码把它上传到
 *    Supabase（见 index.ts 的模式判定）。用户登录后看到的是云端工作区，
 *    浏览器里那份仍然存在于原 key，不会被覆盖也不会被搬运。
 *  - 读失败（损坏 JSON / 隐私模式）→ 当作「没有数据」，不抛错；
 *  - **写失败必须抛错**。以前这里是 `catch {}` 静默吞掉，于是配额满或隐私
 *    模式下的保存会「看起来成功、实际丢失」—— 这正是要消除的假成功。
 */

import type { WorkspaceState } from "@/components/trips/workspace/types";
import { emptyWorkspace } from "./types";

/** 浏览器里匿名工作区的存储槽（与旧代码同一个 key，不迁移、不换名）。 */
export const GUEST_WORKSPACE_KEY = "utripla.trips.workspace.v5";

function hasWorkspaceShape(value: unknown): value is WorkspaceState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<WorkspaceState>;
  return (
    Array.isArray(candidate.trips) &&
    Array.isArray(candidate.saved) &&
    Array.isArray(candidate.inbox) &&
    Array.isArray(candidate.activity)
  );
}

/**
 * 补齐必需容器。`hasWorkspaceShape` 只校验 4 个数组，而 WorkspaceState 还要求
 * `transactions` / `merchantRules`（v5 早期快照可能没有）。这里**只补缺、
 * 不动已有字段** —— 若改成「形状不全即丢弃」，一次外部页保存就会把用户
 * 已有的 trips/saved 整份覆盖成空工作区。
 */
function withRequiredContainers(state: WorkspaceState): WorkspaceState {
  return {
    ...state,
    transactions: Array.isArray(state.transactions) ? state.transactions : [],
    merchantRules:
      state.merchantRules && typeof state.merchantRules === "object" ? state.merchantRules : {},
  };
}

/**
 * 读取匿名工作区。`null` = 浏览器里从来没有存过数据（区别于「存过但是空的」，
 * 后者会返回一个空工作区）。调用方据此决定是否要覆盖当前内存状态。
 */
export function loadGuestWorkspace(): WorkspaceState | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(GUEST_WORKSPACE_KEY);
  } catch {
    // 隐私模式 / 存储被禁用：没有匿名工作区可读。
    return null;
  }
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return hasWorkspaceShape(parsed) ? withRequiredContainers(parsed) : null;
  } catch {
    // 损坏数据：不覆盖磁盘（留证据），也不把半截状态读进内存。
    return null;
  }
}

/** 读取，且**永远**返回可用的工作区（没有数据时给空工作区）。 */
export function loadGuestWorkspaceOrEmpty(): WorkspaceState {
  return loadGuestWorkspace() ?? emptyWorkspace();
}

/** 写入匿名工作区。失败时抛错，绝不吞掉（避免假成功）。 */
export function saveGuestWorkspace(state: WorkspaceState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_WORKSPACE_KEY, JSON.stringify(state));
}
