interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FaqList — FAQ（FINAL CONTRACT: "FAQ = <details>"）。
 * 页面可见组件与 FAQPage JSON-LD 必须一致。原生 <details> 无需 JS 即可展开，
 * 自定义 + 图标在 open 时旋转 45° 变为 ×，使用 ut-* token。
 */
export default function FaqList({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <details
          key={i}
          className="group rounded-ut-md border border-ut-border bg-ut-surface p-5"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ut-ink">
            <span>{item.question}</span>
            <span
              className="text-ut-accent transition-transform duration-[var(--ut-dur-fast)] group-open:rotate-45"
              aria-hidden="true"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </summary>
          <p className="mt-3 leading-[1.6] text-ut-text-2">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
