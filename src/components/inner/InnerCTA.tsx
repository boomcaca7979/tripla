import Link from "next/link";

interface InnerCTAProps {
  href: string;
  label: string;
  title: string;
  description?: string;
}

/**
 * InnerCTA — 内页唯一 Primary CTA（FINAL CONTRACT: "Page max 1 Primary CTA"，
 * 且 Commerce / 转化入口 never hero/first-screen → 置于文末）。
 * 使用品牌 terracotta（bg-ut-accent），不引入蓝色渐变。
 */
export default function InnerCTA({ href, label, title, description }: InnerCTAProps) {
  return (
    <section className="my-12 rounded-ut-lg border border-ut-border bg-ut-surface p-6 sm:p-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-h2 text-ut-ink leading-[var(--ut-text-h2--lh)]">
            {title}
          </h2>
          {description && (
            <p className="mt-2 max-w-xl text-body leading-[1.6] text-ut-text-2">
              {description}
            </p>
          )}
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-2 rounded-ut-sm bg-ut-accent px-5 py-3 text-body font-medium text-ut-inverse transition-colors duration-[var(--ut-dur-fast)] ease-ut-out hover:bg-ut-accent-strong focus-visible:outline-2 focus-visible:outline-ut-accent"
        >
          {label}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
