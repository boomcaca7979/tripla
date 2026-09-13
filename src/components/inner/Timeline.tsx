interface TimelineDay {
  day: number;
  theme: string;
  description: string;
}

/**
 * Timeline — 行程时间线（FINAL CONTRACT: "itinerary = timeline"）。
 * 垂直 hairline + accent 节点，替代旧版的卡片墙 <ol>。
 */
export default function Timeline({ days }: { days: TimelineDay[] }) {
  if (days.length === 0) return null;
  return (
    <ol className="relative border-l border-ut-border pl-6 sm:pl-8">
      {days.map((d) => (
        <li key={d.day} className="relative mb-8 last:mb-0">
          <span
            className="absolute -left-8 top-1 flex h-4 w-4 items-center justify-center rounded-ut-pill border border-ut-accent bg-ut-bg sm:-left-10"
            aria-hidden="true"
          >
            <span className="h-1.5 w-1.5 rounded-ut-pill bg-ut-accent" />
          </span>
          <p className="font-mono text-label uppercase tracking-[0.18em] text-ut-subtle">
            Day {d.day}
          </p>
          <h3 className="mt-1 font-display text-h3 text-ut-ink leading-[var(--ut-text-h3--lh)]">
            {d.theme}
          </h3>
          <p className="mt-2 leading-[1.6] text-ut-text">{d.description}</p>
        </li>
      ))}
    </ol>
  );
}
