"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

// How far the blob follows the cursor, as a share of its distance from the
// logo's center.
const FOLLOW = 0.6;
// How far around the logo (px) the cursor still shows the blob: wide to the
// sides, small above and below so the venue filters under it don't trigger it.
// Only the blob reacts that far out; the link stays the size of the logo.
const REACH_X = 60;
const REACH_Y = 8;
// How quickly the blob catches up with the cursor and fades in or out (ms);
// bigger is slower and softer.
const MOVE_MS = 180;
const FADE_MS = 350;

const CENTER = "translate(-50%, -50%)";

export default function LogoLink() {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const blobRef = useRef<HTMLSpanElement>(null);

  // Tracked on the document, not the link, so the area around the logo can
  // show the blob without an invisible box covering the buttons next to it.
  // A frame loop eases the blob toward the cursor; a CSS transition restarts
  // on every pointermove, which made it stutter and jump.
  useEffect(() => {
    const link = linkRef.current;
    const blob = blobRef.current;
    if (!link || !blob || !window.matchMedia("(hover: hover)").matches) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const target = { x: 0, y: 0, opacity: 0 };
    const current = { x: 0, y: 0, opacity: 0 };
    let frame = 0;
    let last = 0;

    const draw = (now: number) => {
      const dt = last ? now - last : 16;
      last = now;
      const move = reduceMotion ? 1 : 1 - Math.exp(-dt / MOVE_MS);
      const fade = reduceMotion ? 1 : 1 - Math.exp(-dt / FADE_MS);

      // While invisible, jump straight to the cursor so it doesn't glide in
      // from wherever it was last time.
      if (current.opacity < 0.01) {
        current.x = target.x;
        current.y = target.y;
      }
      current.x += (target.x - current.x) * move;
      current.y += (target.y - current.y) * move;
      current.opacity += (target.opacity - current.opacity) * fade;

      blob.style.transform = `translate(calc(-50% + ${current.x}px), calc(-50% + ${current.y}px))`;
      blob.style.opacity = String(current.opacity);

      const settled =
        Math.abs(target.x - current.x) < 0.1 &&
        Math.abs(target.y - current.y) < 0.1 &&
        Math.abs(target.opacity - current.opacity) < 0.005;
      if (settled) {
        frame = 0;
        last = 0;
      } else {
        frame = requestAnimationFrame(draw);
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = link.getBoundingClientRect();
      const near =
        e.clientX > rect.left - REACH_X &&
        e.clientX < rect.right + REACH_X &&
        e.clientY > rect.top - REACH_Y &&
        e.clientY < rect.bottom + REACH_Y;
      // Outside the area it fades out where it is instead of sliding back.
      if (near) {
        target.x = (e.clientX - rect.left - rect.width / 2) * FOLLOW;
        target.y = (e.clientY - rect.top - rect.height / 2) * FOLLOW;
      }
      target.opacity = near ? 1 : 0;
      if (!frame) frame = requestAnimationFrame(draw);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <Link ref={linkRef} href="/" className="relative z-10 isolate active:opacity-50">
      <span
        ref={blobRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-28 w-64"
        style={{ transform: CENTER, opacity: 0 }}
      >
        {/* A radial gradient instead of filter: blur(), which Safari often
            doesn't paint on an animated, fading element. */}
        <span
          className="block size-full animate-blob-pulse motion-reduce:animate-none"
          style={{
            background:
              "radial-gradient(closest-side, rgb(99 102 241 / 0.99), rgb(99 102 241 / 0.08) 55%, transparent)",
          }}
        />
      </span>
      <h2 className="logo mb-2 font-bold text-4xl transition-opacity duration-500">
        poznan.events
      </h2>
    </Link>
  );
}
