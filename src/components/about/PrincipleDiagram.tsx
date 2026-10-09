"use client";

import { motion } from "motion/react";
import type { AboutPrincipleId } from "@/content/about";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { ease } from "@/lib/motion";

type Stroke = { d: string; tone?: "heavy" | "light" | "accent" };

const ring = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0`;

/** Running-bond brick courses in the left band of the material sheet. */
const brick = (() => {
  const parts: string[] = [];
  for (let k = 0; k < 9; k++) {
    const y = 15 + k * 10;
    if (k > 0) parts.push(`M15 ${y} H45`);
    for (const x of k % 2 ? [22.5, 37.5] : [30]) parts.push(`M${x} ${y} V${y + 10}`);
  }
  return parts.join(" ");
})();

const stipple = [
  [52, 24],
  [66, 30],
  [48, 40],
  [58, 46],
  [70, 54],
  [51, 62],
  [63, 70],
  [72, 78],
  [55, 84],
  [67, 92],
  [58, 99],
]
  .map(([x, y]) => ring(x, y, 1.2))
  .join(" ");

const grain = [80, 86, 92, 98].map((x) => `M${x} 15 C${x + 5} 40 ${x - 5} 70 ${x} 105`).join(" ");

/**
 * One small architectural drawing per consideration, on a 120-unit sheet.
 * Generic diagrams — a plan, a section, a hatch schedule — not project drawings.
 * Each has one stroke in red pencil: the idea the drawing is about.
 */
const diagrams: Record<AboutPrincipleId, Stroke[]> = {
  // Plan of a room around an open void; movement entering it.
  space: [
    { d: "M50 105 H15 V15 H105 V105 H70", tone: "heavy" },
    { d: "M35 35 H85 V85 H35 Z M35 35 L85 85 M85 35 L35 85", tone: "light" },
    { d: "M60 118 V72 M55 77 L60 72 L65 77", tone: "accent" },
  ],
  // Section through a skylight; sun falling to a patch on the floor.
  light: [
    { d: "M5 100 H115 M20 100 V35 H50 M70 35 H100 V100", tone: "heavy" },
    { d: `${ring(24, 12, 6)} M76 99 L80 95 M82 99 L86 95 M88 99 L92 95 M94 99 L98 95`, tone: "light" },
    { d: "M38 5 L76 100 M48 5 L86 100 M58 5 L96 100", tone: "accent" },
  ],
  // A wall in three materials: brick, concrete, timber.
  material: [
    { d: "M15 15 H105 V105 H15 Z M45 15 V105 M75 15 V105", tone: "heavy" },
    { d: `${brick} ${stipple} ${grain} M87 60 a3 5 0 1 0 6 0 a3 5 0 1 0 -6 0`, tone: "light" },
    { d: `${ring(60, 60, 3)} M63 60 H114`, tone: "accent" },
  ],
  // Golden rectangle, its regulating lines and spiral.
  proportion: [
    { d: "M10 30 H110 V91.8 H10 Z", tone: "heavy" },
    {
      d: "M71.8 30 V91.8 M71.8 68.2 H110 M86.4 68.2 V91.8 M71.8 77.2 H86.4 M10 91.8 L110 30 M71.8 30 L110 91.8 M10 104 H110 M10 100 V108 M110 100 V108",
      tone: "light",
    },
    {
      d: "M10 91.8 A61.8 61.8 0 0 1 71.8 30 A38.2 38.2 0 0 1 110 68.2 A23.6 23.6 0 0 1 86.4 91.8 A14.6 14.6 0 0 1 71.8 77.2",
      tone: "accent",
    },
  ],
  // Plan with door swings; the route a day takes through it.
  function: [
    { d: "M55 100 H10 V20 H110 V100 H75 M50 20 V40 M50 62 V100 M80 60 H110 M80 20 V30 M80 50 V60", tone: "heavy" },
    { d: "M50 62 H72 A22 22 0 0 0 50 40 M80 50 H60 A20 20 0 0 1 80 30", tone: "light" },
    {
      d: `${ring(65, 112, 2)} M65 110 V51 H28 M33 46 L28 51 L33 56 M65 51 V40 H96 M91 35 L96 40 L91 45`,
      tone: "accent",
    },
  ],
  // A wall corner in plan, called out and drawn again at large scale.
  detail: [
    { d: `M10 110 V70 M10 110 H50 M16 104 V70 M16 104 H50 ${ring(75, 45, 35)}`, tone: "heavy" },
    {
      d: `${ring(13, 107, 8)} M19 101 L50.3 69.7 M55 68 L65 58 M55 58 L65 48 M55 48 L62 41 M72 50 L82 40 M82 50 L92 40 M92 50 L102 40`,
      tone: "light",
    },
    { d: "M55 72 V40 H105 M65 72 V50 H105", tone: "accent" },
  ],
  // Site plan: neighbours, street, plot, north point and the sun's path.
  context: [
    {
      d: "M42 40 H78 V76 H42 Z M42 52 L54 40 M42 64 L66 40 M42 76 L78 40 M54 76 L78 52 M66 76 L78 64",
      tone: "heavy",
    },
    {
      d: `M8 8 H34 V30 H8 Z M86 8 H112 V26 H86 Z M8 62 H26 V88 H8 Z M94 60 H112 V88 H94 Z M0 98 H120 M0 112 H120 M34 32 H86 V90 H34 Z ${ring(102, 43, 7)} M102 35 L105 47 L102 45 L99 47 Z`,
      tone: "light",
    },
    { d: `M6 54 Q60 -18 114 54 ${ring(60, 18, 4)}`, tone: "accent" },
  ],
};

/**
 * Draws the diagram for one consideration over a faint ghost of itself, like
 * tracing paper laid on a drawing. `weight` is the stroke width in sheet
 * units — pass a smaller value the larger the drawing is set.
 */
export function PrincipleDiagram({
  id,
  active,
  weight = 1,
  className,
}: {
  id: AboutPrincipleId;
  active: boolean;
  weight?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const strokes = diagrams[id];
  const width = (s: Stroke) => (s.tone === "heavy" ? weight * 2.2 : weight);

  return (
    <svg aria-hidden viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
      <g strokeOpacity={0.14}>
        {strokes.map((s, i) => (
          <path key={i} d={s.d} strokeWidth={width(s)} />
        ))}
      </g>
      {strokes.map((s, i) => (
        <motion.path
          key={i}
          d={s.d}
          stroke={s.tone === "accent" ? "var(--color-terra)" : "currentColor"}
          strokeWidth={s.tone === "accent" ? weight * 1.4 : width(s)}
          strokeOpacity={s.tone === "light" ? 0.6 : 0.95}
          initial={{ pathLength: reduced ? 1 : 0 }}
          animate={{ pathLength: active || reduced ? 1 : 0 }}
          transition={{ duration: 1.4, ease: ease.inOut, delay: active ? 0.1 + i * 0.25 : 0 }}
        />
      ))}
    </svg>
  );
}
