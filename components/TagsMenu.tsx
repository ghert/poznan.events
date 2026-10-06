"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tag } from "@/lib/types";

// Shorter labels for the header pills only, keyed by tag slug. Everywhere
// else (tag page, event badges, admin) shows the full tag name.
const HEADER_LABELS: Record<string, string> = {
  "jam-session": "jam",
};

// One header pill per tag page; the current tag's pill is filled.
export default function TagsMenu({ tags }: { tags: Tag[] }) {
  const pathname = usePathname();
  const currentTag = pathname.match(/^\/tag\/([^/]+)/)?.[1] ?? null;

  if (!tags.length) return null;

  return (
    <nav
      aria-label="Tagi"
      className="hidden md:flex items-center gap-2 min-w-0 overflow-x-auto"
    >
      {tags.map((tag) => (
        <Link
          key={tag.slug}
          href={`/tag/${tag.slug}`}
          aria-current={tag.slug === currentTag ? "page" : undefined}
          className={`group border-surface-300 hover:bg-base-content hover:text-base-100 border-1 rounded-3xl px-4 py-1 whitespace-nowrap ${tag.slug === currentTag ? "bg-base-content text-base-100" : ""}`}
        >
          {HEADER_LABELS[tag.slug] ?? tag.name}
        </Link>
      ))}
    </nav>
  );
}
