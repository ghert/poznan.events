"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type CSSProperties } from "react";
import { NAV_LINKS } from "./navLinks";
import { Tag } from "@/lib/types";

const DURATION_MS = 300;

// Three bars that fold into an X when `open`.
function MenuToggleIcon({ open }: { open: boolean }) {
  const bar =
    "absolute left-px w-[22px] h-[2.5px] rounded-full bg-current transition-[translate,rotate,opacity] duration-300 ease-out motion-reduce:transition-none";
  return (
    <span aria-hidden className="relative -top-px block size-6">
      <span
        className={`${bar} top-[2.75px] ${open ? "translate-y-2 rotate-45" : ""}`}
      />
      <span className={`${bar} top-[10.75px] ${open ? "opacity-0" : ""}`} />
      <span
        className={`${bar} top-[18.75px] ${open ? "-translate-y-2 -rotate-45" : ""}`}
      />
    </span>
  );
}

// A native modal <dialog> styled as a left side sheet: it renders in the top
// layer and handles Esc and focus trapping itself, so the page doesn't need
// wrapping like daisyUI's .drawer does. The modal covers the header, so it
// holds its own toggle button, pinned over the header one, which morphs into
// the X and back.
export default function MobileDrawer({ tags }: { tags: Tag[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);
  const [togglePos, setTogglePos] = useState<CSSProperties>();
  const pathname = usePathname();
  const currentTag = pathname.match(/^\/tag\/([^/]+)/)?.[1] ?? null;

  const show = () => {
    const dialog = dialogRef.current;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!dialog || !rect) return;
    clearTimeout(closeTimer.current);
    setTogglePos({ top: rect.top, left: rect.left });
    if (!dialog.open) dialog.showModal();
    // Let the closed state paint first so the slide-in transitions.
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
  };

  const close = () => {
    setOpen(false);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(
      () => dialogRef.current?.close(),
      DURATION_MS,
    );
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={show}
        className="btn btn-sm btn-square btn-ghost mr-2 hidden max-md:flex p-0 border-0 hover:bg-transparent"
      >
        <MenuToggleIcon open={false} />
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Menu"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        className="m-0 p-0 w-full h-lvh max-w-none max-h-none bg-transparent backdrop:bg-transparent"
      >
        <button
          type="button"
          aria-label="Zamknij"
          onClick={close}
          style={togglePos}
          className="btn btn-sm btn-square btn-ghost fixed z-10 p-0 border-0 text-base-content hover:bg-transparent focus:outline-0"
        >
          <MenuToggleIcon open={open} />
        </button>
        <div
          onClick={close}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 motion-reduce:transition-none ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`relative h-full w-80 max-w-[85vw] bg-background text-base-content shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex flex-col gap-6 p-4 pt-6 sm:px-8">
            <div aria-hidden className="h-8" />
            {tags.length ? (
              <nav aria-label="Tagi" className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    onClick={close}
                    aria-current={tag.slug === currentTag ? "page" : undefined}
                    className={`border-surface-300 border-1 rounded-3xl px-4 py-1 whitespace-nowrap active:opacity-50 ${tag.slug === currentTag ? "bg-base-content text-base-100" : ""}`}
                  >
                    {tag.name}
                  </Link>
                ))}
              </nav>
            ) : null}
            <nav className="flex flex-col gap-4 text-2xl">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="text-md active:opacity-50"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </dialog>
    </>
  );
}
