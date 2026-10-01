"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A horizontally scrolling row. Native scrolling on touch and trackpads;
 * click-and-drag with a mouse. Snaps gently to each child.
 */
export function HorizontalStrip({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !ref.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 4) {
      drag.current.moved = true;
      ref.current.style.scrollSnapType = "none";
    }
    ref.current.scrollLeft = drag.current.left - dx;
  };
  const onUp = () => {
    if (ref.current) ref.current.style.scrollSnapType = "";
    drag.current = null;
  };

  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      tabIndex={0}
      data-cursor="drag"
      data-lenis-prevent-horizontal
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      className={cn(
        "no-scrollbar flex snap-x snap-mandatory gap-[var(--col-gap)] overflow-x-auto overscroll-x-contain px-[var(--gutter)] [scroll-padding-inline:var(--gutter)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
