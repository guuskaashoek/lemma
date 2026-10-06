"use client";
/** Top navigation links with the active page underlined. */
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({ links }: { links: Array<{ href: string; label: string; badge?: number }> }) {
  const path = usePathname();
  return (
    <nav className="flex items-center gap-1 text-sm">
      {links.map((l) => {
        const active = path === l.href || path.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 ${active ? "bg-surface-2 font-semibold text-fg" : "text-muted hover:text-fg"}`}
          >
            {l.label}
            {!!l.badge && (
              <span className="ml-1.5 rounded-full bg-invert-bg px-1.5 text-xs font-semibold text-invert-fg">{l.badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
