"use client";

import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { Rule } from "./Reveal";

/** Live time in New Delhi — a quiet reminder of where the studio works. */
export function DelhiClock({ className }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
    const tick = () => setTime(fmt.format(new Date()));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 20_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  return (
    <span className={className}>
      <span className="tabular-nums">{time ?? "--:--"}</span> IST
    </span>
  );
}

export function Coordinates({ className }: { className?: string }) {
  return (
    <span className={cn("label", className)}>
      {site.coordinates.lat} &nbsp; {site.coordinates.lng}
    </span>
  );
}

/**
 * The header line for every major section:
 *   02 / 08 — PROJECTS ............................ SELECTED WORK
 */
export function SectionHead({
  index,
  total = 8,
  label,
  meta,
  className,
}: {
  index: number;
  total?: number;
  label: string;
  meta?: string;
  className?: string;
}) {
  return (
    <div className={cn("frame", className)}>
      <div className="label flex items-end justify-between gap-6 pb-3">
        <span className="flex gap-4">
          <span>
            {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span aria-hidden>—</span>
          <span>{label}</span>
        </span>
        {meta && <span className="hidden text-right opacity-60 sm:block">{meta}</span>}
      </div>
      <Rule />
    </div>
  );
}

/** Crosshair registration mark used at corners of framed drawings and images. */
export function RegMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={cn("size-4", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M8 0v16M0 8h16" />
      <circle cx="8" cy="8" r="3.5" />
    </svg>
  );
}
