"use client";

import { animate, useInView } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { SectionHead } from "@/components/ui/Annotations";
import { Img } from "@/components/ui/Img";
import { PlaceholderNote } from "@/components/ui/ParallaxImage";
import { FadeIn, RevealLines } from "@/components/ui/Reveal";
import { visualization } from "@/content/studio";
import type { ImageAsset } from "@/lib/types";
import { clamp, cn, pad } from "@/lib/utils";

const MIN_GAP = 6;

/**
 * 06 — Visualization. One space read three ways — a line drawing, a white
 * model, the finished room — divided by two draggable handles.
 *
 * Without dedicated stage images, CONCEPT and VISUALIZATION are derived from
 * the base photograph (edge-detection SVG filter / high-key monochrome), so
 * the section works today and improves as soon as real sketches and renders
 * are added in src/content/studio.ts.
 */
export function Visualization() {
  const reduced = usePrefersReducedMotion();
  const frame = useRef<HTMLDivElement>(null);
  const seen = useInView(frame, { once: true, margin: "0px 0px -30% 0px" });
  const [a, setA] = useState(100);
  const [b, setB] = useState(100);
  const dragging = useRef<"a" | "b" | null>(null);

  const [concept, vis, space] = visualization.stages;
  const base = visualization.base;

  // Opening move: the sketch draws back to reveal the model, then the room.
  useEffect(() => {
    if (!seen) return;
    if (reduced) {
      const t = setTimeout(() => {
        setA(33);
        setB(66);
      }, 0);
      return () => clearTimeout(t);
    }
    const ca = animate(100, 33, { duration: 1.8, ease: [0.76, 0, 0.24, 1], delay: 0.2, onUpdate: setA });
    const cb = animate(100, 66, { duration: 1.6, ease: [0.76, 0, 0.24, 1], delay: 0.5, onUpdate: setB });
    return () => {
      ca.stop();
      cb.stop();
    };
  }, [seen, reduced]);

  const valueAt = (clientX: number) => {
    const r = frame.current!.getBoundingClientRect();
    return clamp(((clientX - r.left) / r.width) * 100, 0, 100);
  };

  const setHandle = useCallback(
    (handle: "a" | "b", v: number) => {
      if (handle === "a") setA(clamp(v, 0, b - MIN_GAP));
      else setB(clamp(v, a + MIN_GAP, 100));
    },
    [a, b],
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const v = valueAt(e.clientX);
    dragging.current = Math.abs(v - a) <= Math.abs(v - b) ? "a" : "b";
    e.currentTarget.setPointerCapture(e.pointerId);
    setHandle(dragging.current, v);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) setHandle(dragging.current, valueAt(e.clientX));
  };
  const onPointerUp = () => {
    dragging.current = null;
  };

  const onKey = (handle: "a" | "b") => (e: KeyboardEvent<HTMLDivElement>) => {
    const current = handle === "a" ? a : b;
    const step = e.shiftKey ? 10 : 2;
    const next =
      e.key === "ArrowLeft" || e.key === "ArrowDown"
        ? current - step
        : e.key === "ArrowRight" || e.key === "ArrowUp"
          ? current + step
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? 100
              : null;
    if (next === null) return;
    e.preventDefault();
    setHandle(handle, next);
  };

  const regions = [
    { stage: concept, from: 0, to: a },
    { stage: vis, from: a, to: b },
    { stage: space, from: b, to: 100 },
  ];

  return (
    <section
      id="visualization"
      aria-labelledby="visualization-title"
      data-theme="dark"
      data-section-index="06"
      data-section-label="Visualization"
      className="relative bg-carbon pb-28 pt-20 text-paper md:pb-40 md:pt-28"
    >
      <SketchFilter />
      <SectionHead index={6} label="Visualization" meta="Concept → Visualization → Space" />

      <div className="frame grid-12 mt-14 gap-y-8 md:mt-20">
        <h2 id="visualization-title" className="col-span-12 text-display font-medium uppercase condensed md:col-span-8">
          <RevealLines
            lines={[
              visualization.title[0],
              <span key="s" className="font-serif font-normal normal-case italic text-paper/80">
                {visualization.title[1]}
              </span>,
            ]}
          />
        </h2>
        <FadeIn className="col-span-12 self-end text-paper/65 md:col-span-3 md:col-start-10">
          {visualization.intro}
        </FadeIn>
      </div>

      <div className="frame mt-14 md:mt-20">
        <div
          ref={frame}
          className="relative aspect-[4/5] touch-pan-y select-none overflow-hidden bg-graphite sm:aspect-[16/10] lg:aspect-[16/8]"
          data-cursor="drag"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Space */}
          <StageImage asset={space.image ?? base} className="tone" />
          {/* Visualization — white model */}
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - b}% 0 0)` }}>
            <StageImage
              asset={vis.image ?? base}
              className={vis.image ? "tone" : "[filter:grayscale(1)_brightness(1.16)_contrast(0.82)]"}
            />
          </div>
          {/* Concept — line drawing */}
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - a}% 0 0)` }}>
            <StageImage asset={concept.image ?? base} className={concept.image ? "" : "[filter:url(#rsd-sketch)]"} />
            {!concept.image && <div className="paper-grid absolute inset-0 opacity-60" />}
          </div>

          {/* Region labels */}
          {regions.map(({ stage, from, to }, i) => (
            <div
              key={stage.id}
              aria-hidden
              className="pointer-events-none absolute top-0 flex justify-center pt-4 transition-opacity duration-300"
              style={{ left: `${from}%`, width: `${to - from}%`, opacity: to - from > 14 ? 1 : 0 }}
            >
              <span
                className={cn(
                  "label whitespace-nowrap px-2 py-1",
                  i === 0 ? "bg-ink/80 text-paper" : i === 1 ? "bg-paper/85 text-ink" : "bg-ink/70 text-paper",
                )}
              >
                {pad(i + 1)} — {stage.label}
              </span>
            </div>
          ))}

          {/* Handles */}
          {(["a", "b"] as const).map((h) => {
            const v = h === "a" ? a : b;
            const label = h === "a" ? `${concept.label} to ${vis.label}` : `${vis.label} to ${space.label}`;
            return (
              <div
                key={h}
                role="slider"
                tabIndex={0}
                aria-label={`Divider: ${label}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(v)}
                aria-orientation="horizontal"
                onKeyDown={onKey(h)}
                className="group absolute inset-y-0 z-10 -ml-5 flex w-10 justify-center focus-visible:outline-none"
                style={{ left: `${v}%` }}
              >
                <span className="absolute inset-y-0 w-px bg-paper shadow-[0_0_0_0.5px_rgb(15_15_14/0.4)]" />
                <span className="absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-paper bg-ink/70 text-[0.625rem] text-paper backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110 group-focus-visible:ring-1 group-focus-visible:ring-paper group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-ink">
                  ‹ ›
                </span>
              </div>
            );
          })}

          <PlaceholderNote asset={base} />
        </div>

        <ol className="mt-6 grid grid-cols-3 gap-[var(--col-gap)] border-t border-paper/15 pt-4">
          {visualization.stages.map((s, i) => (
            <li key={s.id} className="flex flex-col gap-1">
              <span className="label text-paper/60">
                {pad(i + 1)} {i < 2 && <span aria-hidden>→</span>}
              </span>
              <span className="text-lede font-medium uppercase condensed">{s.label}</span>
              <span className="hidden font-serif italic text-paper/60 sm:block">{s.caption}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function StageImage({ asset, className }: { asset: ImageAsset; className?: string }) {
  return (
    <Img
      asset={asset}
      alt=""
      fill
      sizes="(min-width: 768px) 92vw, 100vw"
      draggable={false}
      className={cn("pointer-events-none object-cover", className)}
    />
  );
}

/** Edge detection on a warm paper ground — a photograph read as a pencil drawing. */
function SketchFilter() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id="rsd-sketch" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0" />
        <feGaussianBlur stdDeviation="0.7" />
        <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="-9" intercept="0.95" />
          <feFuncG type="linear" slope="-9" intercept="0.93" />
          <feFuncB type="linear" slope="-9" intercept="0.89" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}
