"use client";

/**
 * TabChecklist — Notion Todo 式清单（Workspace-driven 重构）。
 *
 *  - 每个阶段一个分组；组尾永久捕获行，写任务名 Enter 即存（Capture first）；
 *  - 点击文字 → inline 改写；checkbox 直接切换；hover 出现 Delete；
 *  - phase 通过组标题旁的 inline select 修改单条所属阶段。
 */

import type { ChecklistPhase, Trip, WorkspaceAction } from "./types";
import { CHECKLIST_PHASE_LABELS } from "./logic";
import { CaptureLine, HoverActions, HoverDelete, InlineSelect, InlineText } from "./inline";
import { ModuleHead, Panel } from "./ui";

const PHASES: ChecklistPhase[] = ["before", "during", "after"];

export default function TabChecklist({
  trip,
  dispatch,
}: {
  trip: Trip;
  dispatch: (action: WorkspaceAction) => void;
  addNonce: number;
}) {
  const done = trip.checklist.filter((c) => c.done).length;

  return (
    <div>
      <ModuleHead
        title="Checklist"
        meta={trip.checklist.length > 0 ? `${trip.checklist.length - done} of ${trip.checklist.length} left` : undefined}
      />

      <div className="space-y-8">
        {PHASES.map((phase) => (
          <PhaseGroup key={phase} trip={trip} phase={phase} dispatch={dispatch} />
        ))}
      </div>
    </div>
  );
}

function PhaseGroup({
  trip,
  phase,
  dispatch,
}: {
  trip: Trip;
  phase: ChecklistPhase;
  dispatch: (action: WorkspaceAction) => void;
}) {
  const items = trip.checklist.filter((c) => c.phase === phase);
  const doneCount = items.filter((c) => c.done).length;

  const phaseOptions = PHASES.map((p) => ({ value: p, label: CHECKLIST_PHASE_LABELS[p] }));

  return (
    <section>
      <p className="mb-3 text-[0.875rem] font-semibold tracking-[-0.005em] text-ut-ink">
        {phase === "before" ? `Before ${trip.destination}` : CHECKLIST_PHASE_LABELS[phase]}
        {items.length > 0 && (
          <span className="ml-2 text-[0.75rem] font-medium text-[#9aa5a8]">
            {doneCount}/{items.length}
          </span>
        )}
      </p>

      <Panel className="divide-y divide-[#eef1f0]">
        {items.length === 0 && (
          <p className="px-5 py-3 text-body-sm text-ut-muted">Nothing here yet.</p>
        )}

        {items.map((c) => (
          <div key={c.id} className="group flex items-center gap-3 px-4 py-2">
            <button
              type="button"
              aria-pressed={c.done}
              aria-label={c.done ? `Uncheck ${c.label}` : `Check ${c.label}`}
              onClick={() => dispatch({ type: "TOGGLE_CHECKLIST", tripId: trip.id, itemId: c.id })}
              className={`flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded border text-[0.625rem] font-bold transition-colors ${
                c.done
                  ? "border-ut-accent bg-ut-accent text-white"
                  : "border-[#c6d0ce] bg-white text-transparent hover:border-ut-accent"
              }`}
            >
              ✓
            </button>
            <span className={`min-w-0 flex-1 ${c.done ? "line-through decoration-[#c6d0ce]" : ""}`}>
              <InlineText
                value={c.label}
                className={`text-[0.875rem] ${c.done ? "text-ut-muted" : "text-ut-text"}`}
                placeholder="Task"
                onCommit={(next) => {
                  if (!next) return;
                  dispatch({
                    type: "PATCH_CHECKLIST",
                    tripId: trip.id,
                    itemId: c.id,
                    patch: { label: next },
                  } as never);
                }}
              />
            </span>
            <HoverActions>
              <InlineSelect
                value={c.phase}
                options={phaseOptions}
                render={(v) => (
                  <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#9aa5a8]">
                    {CHECKLIST_PHASE_LABELS[v]}
                  </span>
                )}
                onCommit={(p) =>
                  dispatch({ type: "PATCH_CHECKLIST", tripId: trip.id, itemId: c.id, patch: { phase: p } } as never)
                }
              />
              <HoverDelete
                label={c.label}
                onConfirm={() => dispatch({ type: "REMOVE_CHECKLIST", tripId: trip.id, itemId: c.id })}
              />
            </HoverActions>
          </div>
        ))}

        {/* 永久捕获行：写任务名按 Enter 即成一条（其余阶段之后可改） */}
        <div className="flex items-center gap-3 border-t border-[#eef1f0] px-4">
          <span aria-hidden="true" className="h-[18px] w-[18px] shrink-0 rounded border border-dashed border-[#c6d0ce]" />
          <CaptureLine
            placeholder="Write something..."
            onSubmit={(text) => {
              const label = text.trim();
              if (label) dispatch({ type: "ADD_CHECKLIST", tripId: trip.id, label, phase });
            }}
          />
        </div>
      </Panel>
    </section>
  );
}
