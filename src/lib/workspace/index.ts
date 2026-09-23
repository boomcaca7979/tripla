/**
 * workspace — 统一数据访问层（/trips 个人旅行工作台）。
 *
 * 对外只有两个动作，且**模式决定一切**：
 *
 *   loadWorkspace(mode)            读：guest → localStorage；remote → Supabase
 *   commitWorkspace(mode, p, n)    写：guest → localStorage；remote → 逐行增量
 *
 * 「清空工作区」不另设通道：dispatch RESET 之后状态变成空工作区，
 * commitWorkspace 自然算出「删掉所有行」的增量。少一条代码路径就少一处
 * 可能与既有通道不一致的行为。
 *
 * 两条通道之间没有任何搬运通道：
 *  - 匿名时只读写 localStorage，登录不会把这份数据上传到云端（产品要求：
 *    用户的匿名草稿属于这台设备，不能因为注册就被搬走）；
 *  - 登录后只读写 Supabase，浏览器里那份匿名数据原地不动，登出后仍然可用；
 *  - 因此「切换账号」不存在数据泄漏面：读由 RLS 过滤，写由 user_id 约束，
 *    内存状态在模式变化时整体丢弃并重新加载（见 TripsWorkspace 的 loadSeq）。
 *
 * 基线（baseline）由调用方持有：只有一次提交**成功**之后才允许推进。
 * 失败即抛出，基线不动 → 下一次提交重新算出同一份增量并重试，最终收敛。
 * 这是「不出现假成功」的具体实现方式。
 */

import type { WorkspaceState } from "@/components/trips/workspace/types";
import { diffWorkspace, hasChanges, type WorkspaceChanges } from "./diff";
import { flattenWorkspace, idScope } from "./mappers";
import { applyRemoteChanges, loadRemoteWorkspace } from "./remote";
import {
  GUEST_WORKSPACE_KEY,
  loadGuestWorkspaceOrEmpty,
  saveGuestWorkspace,
} from "./guest";
import { emptyWorkspace, type WorkspaceMode } from "./types";

/** 模式的稳定标识：用于判断「这次提交是否还是同一个人」。 */
export function modeKey(mode: WorkspaceMode): string {
  return mode.kind === "guest" ? "guest" : `remote:${mode.userId}`;
}

export function isModeEqual(a: WorkspaceMode, b: WorkspaceMode): boolean {
  return modeKey(a) === modeKey(b);
}

/** 读取工作区。永远返回确定的状态（空库 = 空工作区，而不是 null）。 */
export async function loadWorkspace(mode: WorkspaceMode): Promise<WorkspaceState> {
  if (mode.kind === "guest") return loadGuestWorkspaceOrEmpty();
  return loadRemoteWorkspace(mode.userId);
}

/**
 * 提交一次状态变化。
 *
 * @param prev 上一次**成功落盘**的状态（基线）。匿名通道忽略它。
 * @param next 当前内存状态。
 * @throws 任何真实的写入失败（guest 的配额/隐私模式、remote 的任意请求错误）。
 */
export async function commitWorkspace(
  mode: WorkspaceMode,
  prev: WorkspaceState,
  next: WorkspaceState,
): Promise<void> {
  if (mode.kind === "guest") {
    saveGuestWorkspace(next);
    return;
  }

  const scope = idScope(mode.userId);
  const changes = diffWorkspace(flattenWorkspace(scope, prev), flattenWorkspace(scope, next));
  // 空增量必须完全不发请求：读取、切换视图、纯本地派生都不会改动数据。
  if (!hasChanges(changes)) return;
  await applyRemoteChanges(mode.userId, changes);
}

/** 清空工作区的增量（= 删掉全部行）；仅用于 UI 提示与测试。 */
export function previewChanges(
  mode: WorkspaceMode,
  prev: WorkspaceState,
  next: WorkspaceState,
): WorkspaceChanges | null {
  if (mode.kind === "guest") return null;
  const scope = idScope(mode.userId);
  return diffWorkspace(flattenWorkspace(scope, prev), flattenWorkspace(scope, next));
}

export { GUEST_WORKSPACE_KEY, emptyWorkspace, hasChanges, idScope };
export type { WorkspaceChanges, WorkspaceMode };
export { WorkspaceSyncError } from "./remote";
export { diffWorkspace } from "./diff";
export { flattenWorkspace, assembleWorkspace, toDbId, fromDbId } from "./mappers";
export { loadGuestWorkspaceOrEmpty, saveGuestWorkspace } from "./guest";
