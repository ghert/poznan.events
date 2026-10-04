"use client";

import Link from "next/link";
import { useRef } from "react";
import { MenuIcon, XIcon } from "lucide-react";
import { NAV_LINKS } from "./navLinks";

// A native modal <dialog> styled as a left side sheet: it renders in the top
// layer and handles the backdrop, Esc and focus trapping itself, so the page
// doesn't need wrapping like daisyUI's .drawer does.
export default function MobileDrawer() {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        onClick={() => ref.current?.showModal()}
        className="btn btn-sm btn-square btn-ghost mr-2 hidden max-md:flex p-0 border-0"
      >
        <MenuIcon width="24" height="24" />
      </button>
      <dialog
        ref={ref}
        aria-label="Menu"
        // A click whose target is the <dialog> itself landed on the backdrop.
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-0 h-lvh max-h-none w-80 max-w-[85vw] bg-background text-base-content shadow-sm transition-transform duration-200 ease-out starting:open:-translate-x-full backdrop:bg-black/40"
      >
        <div className="flex flex-col gap-6 p-4 pt-6 sm:px-8">
          <button
            type="button"
            aria-label="Zamknij"
            onClick={close}
            className="btn btn-sm btn-square btn-ghost self-start p-0 border-0 focus:outline-0"
          >
            <XIcon width="30" height="30" />
          </button>
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
      </dialog>
    </>
  );
}
