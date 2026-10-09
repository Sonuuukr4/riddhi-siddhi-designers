"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { site } from "@/config/site";
import { ease } from "@/lib/motion";

/** Rounded so server and browser trigonometry produce identical markup. */
const round = (n: number) => Math.round(n * 100) / 100;

/**
 * A survey-style marker for the studio: rings, crosshair and north point.
 * Deliberately abstract — it shows where, not a map of the streets.
 */
export function LocationPlate() {
  const reduced = usePrefersReducedMotion();
  const draw = (delay: number) => ({
    initial: { pathLength: reduced ? 1 : 0 },
    whileInView: { pathLength: 1 },
    viewport: { once: true },
    transition: { duration: 1.8, ease: ease.inOut, delay },
  });

  return (
    <figure className="relative aspect-square w-full">
      <svg
        viewBox="0 0 300 300"
        className="h-full w-full text-paper"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        aria-hidden
      >
        {[130, 96, 62, 28].map((r, i) => (
          <motion.circle key={r} cx="150" cy="150" r={r} strokeOpacity={0.18 + i * 0.12} {...draw(i * 0.15)} />
        ))}
        <motion.line x1="150" y1="6" x2="150" y2="294" strokeOpacity={0.35} {...draw(0.3)} />
        <motion.line x1="6" y1="150" x2="294" y2="150" strokeOpacity={0.35} {...draw(0.4)} />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const long = i % 6 === 0;
          return (
            <line
              key={i}
              x1={round(150 + Math.cos(a) * 130)}
              y1={round(150 + Math.sin(a) * 130)}
              x2={round(150 + Math.cos(a) * (long ? 120 : 125))}
              y2={round(150 + Math.sin(a) * (long ? 120 : 125))}
              strokeOpacity={0.5}
            />
          );
        })}
        <motion.path d="M150 30 L157 52 L150 47 L143 52 Z" fill="currentColor" {...draw(0.8)} />
        <motion.circle
          cx="150"
          cy="150"
          r="5"
          fill="var(--color-terra)"
          stroke="none"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.2, ease: ease.out }}
        />
        {!reduced && (
          <motion.circle
            cx="150"
            cy="150"
            r="5"
            stroke="var(--color-terra)"
            animate={{ r: [5, 26], opacity: [0.8, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", delay: 2 }}
          />
        )}
        <text
          x="150"
          y="22"
          textAnchor="middle"
          className="fill-current stroke-none font-mono text-[9px] tracking-widest"
        >
          N
        </text>
      </svg>
      <figcaption className="label absolute bottom-0 left-0 flex w-full justify-between text-paper/60">
        <span>{site.coordinates.lat}</span>
        <span>East Patel Nagar</span>
        <span>{site.coordinates.lng}</span>
      </figcaption>
    </figure>
  );
}
