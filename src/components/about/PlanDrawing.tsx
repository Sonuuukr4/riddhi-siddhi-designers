"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

const AXES_X = [60, 160, 260, 360];
const AXES_Y = [60, 160, 260];
const ring = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0`;

/**
 * A generic plan — structural grid, walls, openings, a stair, a court and a
 * section line in red pencil — drawn in on arrival. A graphic device in the
 * site's drawing-sheet voice, not a drawing of the studio or of any project.
 */
export function PlanDrawing({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const draw = (delay: number, duration = 1.8) => ({
    initial: { pathLength: reduced ? 1 : 0 },
    animate: { pathLength: 1 },
    transition: { duration, ease: ease.inOut, delay },
  });
  const fade = (delay: number, opacity = 1) => ({
    initial: { opacity: 0 },
    animate: { opacity },
    transition: { duration: 1.2, ease: ease.soft, delay },
  });
  const text = "stroke-none font-mono text-[8px] tracking-widest";

  return (
    <svg
      viewBox="0 0 440 320"
      className={cn("h-auto w-full", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.75"
      aria-hidden
    >
      {/* Structural grid */}
      <motion.path
        d={[...AXES_X.map((x) => `M${x} 30 V300`), ...AXES_Y.map((y) => `M30 ${y} H390`)].join(" ")}
        strokeOpacity={0.16}
        {...draw(0.1, 2.2)}
      />
      <motion.path
        d={[...AXES_X.map((x) => ring(x, 18, 8)), ...AXES_Y.map((y) => ring(18, y, 8))].join(" ")}
        strokeOpacity={0.4}
        {...draw(0.3, 1.4)}
      />

      {/* Walls and partitions */}
      <motion.path
        d="M60 60 H130 M190 60 H360 V120 M360 180 V260 H230 M180 260 H60 V60"
        strokeWidth={2.2}
        strokeOpacity={0.75}
        {...draw(0.5, 2.2)}
      />
      <motion.path
        d="M160 60 V120 M160 170 V260 M260 160 H360 M260 160 V205"
        strokeWidth={1.4}
        strokeOpacity={0.6}
        {...draw(0.9)}
      />

      {/* Glazing and door swings */}
      <motion.path d="M130 57 H190 M130 63 H190 M357 120 V180 M363 120 V180" strokeOpacity={0.5} {...draw(1.2, 1.2)} />
      <motion.path
        d="M180 260 V210 A50 50 0 0 1 230 260 M160 170 H210 A50 50 0 0 0 160 120"
        strokeOpacity={0.5}
        {...draw(1.3, 1.6)}
      />

      {/* Open court and stair */}
      <motion.path
        d="M190 90 H240 V140 H190 Z M190 90 L240 140 M240 90 L190 140"
        strokeOpacity={0.45}
        {...draw(1.5, 1.6)}
      />
      <motion.path
        d="M72 195 H148 M72 245 H148 M84 195 V245 M96 195 V245 M108 195 V245 M120 195 V245 M132 195 V245 M76 220 H142 M136 215 L142 220 L136 225"
        strokeOpacity={0.45}
        {...draw(1.6, 1.8)}
      />

      {/* Section line A—A, in red pencil */}
      <motion.path d="M36 110 H384" stroke="var(--color-terra)" strokeDasharray="14 4 2 4" {...fade(1.9)} />
      <motion.path d="M36 100 V120 M384 100 V120" stroke="var(--color-terra)" strokeWidth={1.4} {...draw(2, 0.8)} />

      {/* Dimension string, north point, scale bar */}
      <motion.path
        d="M60 288 H360 M60 268 V296 M160 280 V296 M260 280 V296 M360 268 V296 M56 292 L64 284 M156 292 L164 284 M256 292 L264 284 M356 292 L364 284"
        strokeOpacity={0.4}
        {...draw(2, 1.6)}
      />
      <motion.path
        d={`${ring(408, 70, 14)} M408 50 L413 76 L408 71 L403 76 Z`}
        strokeOpacity={0.6}
        {...draw(2.1, 1.4)}
      />
      <motion.path d="M380 300 H430 M380 296 V304 M405 298 V302 M430 296 V304" strokeOpacity={0.5} {...draw(2.2, 1)} />

      <motion.g {...fade(2.2, 0.6)} className="fill-current">
        {["A", "B", "C", "D"].map((l, i) => (
          <text key={l} x={AXES_X[i]} y={21} textAnchor="middle" className={text}>
            {l}
          </text>
        ))}
        {AXES_Y.map((y, i) => (
          <text key={y} x={18} y={y + 3} textAnchor="middle" className={text}>
            {i + 1}
          </text>
        ))}
        <text x={408} y={44} textAnchor="middle" className={text}>
          N
        </text>
        <text x={405} y={315} textAnchor="middle" className={text}>
          NTS
        </text>
      </motion.g>
      <motion.g {...fade(2.3)} className="fill-terra">
        <text x={36} y={94} textAnchor="middle" className={text}>
          A
        </text>
        <text x={384} y={94} textAnchor="middle" className={text}>
          A
        </text>
      </motion.g>
    </svg>
  );
}
