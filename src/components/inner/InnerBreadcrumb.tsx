import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

/**
 * InnerBreadcrumb — 内页面包屑（FINAL CONTRACT: 内页统一导航约定）。
 * 末项为当前页（aria-current=page），不渲染链接；其余为 ut-* token 链接。
 */
export default function InnerBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-ut-muted"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="inline-flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-ut-text focus-visible:outline-2 focus-visible:outline-ut-accent"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "text-ut-text" : ""}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <span className="text-ut-subtle" aria-hidden="true">
                /
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
