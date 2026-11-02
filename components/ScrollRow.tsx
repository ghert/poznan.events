"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

// A horizontally scrolling row with no scrollbar. With a mouse, arrow buttons
// over a fade appear at whichever end has more content; touch just swipes.
export default function ScrollRow({
  children,
  className = "",
  scrollerClassName = "",
}: {
  children: ReactNode;
  className?: string;
  scrollerClassName?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 1);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    // Children are observed too, so late font loads that widen them count.
    const observer = new ResizeObserver(update);
    observer.observe(el);
    for (const child of el.children) observer.observe(child);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [children]);

  const scroll = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    el?.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <div className={`relative min-w-0 ${className}`}>
      <div
        ref={scrollerRef}
        className={`isolate flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${scrollerClassName}`}
      >
        {children}
      </div>
      <ScrollButton side="left" visible={canLeft} onClick={() => scroll(-1)} />
      <ScrollButton side="right" visible={canRight} onClick={() => scroll(1)} />
    </div>
  );
}

function ScrollButton({
  side,
  visible,
  onClick,
}: {
  side: "left" | "right";
  visible: boolean;
  onClick: () => void;
}) {
  const left = side === "left";
  return (
    <div
      aria-hidden
      className={`absolute inset-y-0 flex items-center w-16 pointer-events-none transition-opacity duration-200 pointer-coarse:hidden max-md:hidden ${left ? "left-0 justify-start bg-linear-to-r" : "right-0 justify-end bg-linear-to-l"} from-background from-40% to-transparent ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <button
        type="button"
        tabIndex={-1}
        onClick={onClick}
        className={`flex items-center h-full w-10 ${left ? "justify-start" : "justify-end"} hover:opacity-60 active:opacity-40 ${visible ? "pointer-events-auto cursor-pointer" : ""}`}
      >
        {left ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
      </button>
    </div>
  );
}
