"use client";

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { usePageTransition } from "@/components/providers/TransitionProvider";
import { Coordinates } from "@/components/ui/Annotations";
import { Img } from "@/components/ui/Img";
import { PlaceholderNote } from "@/components/ui/ParallaxImage";
import { site } from "@/config/site";
import { hero } from "@/content/studio";
import { ease } from "@/lib/motion";
import { pad } from "@/lib/utils";

const SLIDE_MS = 6500;

/**
 * Full-screen masthead. Three slow slides (Space / Form / Light) sit behind
 * the studio name. On fine pointers the cursor draws a crosshair with live
 * coordinates, reveals a drafting grid around itself and shifts the image
 * and type by a few pixels in opposite directions.
 */
export function Hero() {
  const reduced = usePrefersReducedMotion();
  const { navigate } = usePageTransition();
  const ref = useRef<HTMLElement>(null);
  const [slide, setSlide] = useState(0);
  const [pointerActive, setPointerActive] = useState(false);

  // Slides advance on a timer.
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % hero.slides.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [reduced]);

  // Pointer → normalised (-0.5…0.5) and pixel positions.
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const px = useMotionValue(-999);
  const py = useMotionValue(-999);
  const sx = useSpring(nx, { stiffness: 60, damping: 20 });
  const sy = useSpring(ny, { stiffness: 60, damping: 20 });
  const cx = useSpring(px, { stiffness: 400, damping: 40 });
  const cy = useSpring(py, { stiffness: 400, damping: 40 });

  const imageX = useTransform(sx, (v) => v * -24);
  const imageY = useTransform(sy, (v) => v * -16);
  const typeX = useTransform(sx, (v) => v * 10);
  const typeY = useTransform(sy, (v) => v * 6);
  const maskX = useMotionTemplate`${px}px`;
  const maskY = useMotionTemplate`${py}px`;
  const readX = useTransform(cx, (v) => pad(Math.max(0, Math.round(v)), 4));
  const readY = useTransform(cy, (v) => pad(Math.max(0, Math.round(v)), 4));

  // Scroll: the hero sinks and darkens as the page moves on.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sinkY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [0, 0.65]);
  const typeLift = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    nx.set((e.clientX - r.left) / r.width - 0.5);
    ny.set((e.clientY - r.top) / r.height - 0.5);
    px.set(e.clientX - r.left);
    py.set(e.clientY - r.top);
    if (!pointerActive) setPointerActive(true);
  };

  const current = hero.slides[slide];

  return (
    <section
      ref={ref}
      aria-label="Introduction"
      data-theme="dark"
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-ink text-paper"
      onPointerMove={onMove}
      onPointerLeave={() => setPointerActive(false)}
    >
      {/* — Imagery ———————————————————————————— */}
      <motion.div className="absolute inset-0" style={{ y: reduced ? 0 : sinkY }}>
        <motion.div className="absolute -inset-8" style={{ x: imageX, y: imageY }}>
          <AnimatePresence initial={false}>
            <motion.div
              key={current.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: ease.soft }}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ scale: reduced ? 1 : 1.14 }}
                animate={{ scale: 1.02 }}
                transition={{ duration: SLIDE_MS / 1000 + 2, ease: "linear" }}
              >
                <Img
                  asset={current.image}
                  alt=""
                  fill
                  priority={slide === 0}
                  sizes="100vw"
                  className="tone object-cover"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_15_14/0.55)_0%,rgb(15_15_14/0.05)_35%,rgb(15_15_14/0.15)_60%,rgb(15_15_14/0.85)_100%)]" />
        <motion.div className="absolute inset-0 bg-ink" style={{ opacity: fade }} />
      </motion.div>

      {/* Warm the cache for the next slide so the crossfade never reveals an empty frame. */}
      {!reduced && (
        <div aria-hidden className="pointer-events-none absolute size-px overflow-hidden opacity-0">
          <Img asset={hero.slides[(slide + 1) % hero.slides.length].image} alt="" fill sizes="100vw" />
        </div>
      )}

      {/* — Cursor drafting layer ———————————————— */}
      <motion.div
        aria-hidden
        className="cursor-grid pointer-events-none absolute inset-0 hidden md:block"
        style={{ "--mx": maskX, "--my": maskY } as never}
        animate={{ opacity: pointerActive ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden md:block"
        animate={{ opacity: pointerActive ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.span className="absolute inset-x-0 top-0 h-px bg-paper/25" style={{ y: cy }} />
        <motion.span className="absolute inset-y-0 left-0 w-px bg-paper/25" style={{ x: cx }} />
        <motion.div
          className="label absolute left-0 top-0 flex gap-3 pl-3 pt-2 text-[0.625rem] text-paper/70"
          style={{ x: cx, y: cy }}
        >
          <span>
            X <motion.span>{readX}</motion.span>
          </span>
          <span>
            Y <motion.span>{readY}</motion.span>
          </span>
        </motion.div>
      </motion.div>

      {/* — Composition ————————————————————————— */}
      <motion.div className="relative flex h-full flex-col" style={{ y: reduced ? 0 : typeLift }}>
        <div className="frame grid-12 pt-[calc(var(--header-h)+1.75rem)] md:pt-[calc(var(--header-h)+3rem)]">
          <ul className="caps col-span-6 space-y-1 text-paper/85 md:col-span-3">
            {hero.disciplines.map((d, i) => (
              <li key={d} className="line-mask">
                <motion.span
                  className="block"
                  initial={{ y: "125%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.2, ease: ease.out, delay: 1 + i * 0.08 }}
                >
                  {d}
                </motion.span>
              </li>
            ))}
          </ul>
          <div className="col-span-6 text-right md:col-span-3 md:col-start-10">
            <motion.p
              className="label text-paper/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.3 }}
            >
              Fig. {pad(slide + 1)} / {pad(hero.slides.length)}
            </motion.p>
            <div className="mt-1 h-[1.6em] overflow-hidden font-serif text-2xl italic md:text-3xl">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={current.id}
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.8, ease: ease.out }}
                >
                  {current.word}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <motion.div className="frame" style={{ x: typeX, y: typeY }}>
          <h1 className="text-[min(18vw,24svh)] font-medium md:text-[min(15.5vw,24svh)] uppercase leading-[0.8] tracking-[-0.02em] condensed">
            <span className="sr-only">{site.name} — architecture and interior design studio, New Delhi</span>
            <span aria-hidden className="block">
              {["Riddhi", "Siddhi", "Designers"].map((word, i) => (
                <span key={word} className="line-mask">
                  <motion.span
                    className={`block ${i === 1 ? "pl-[16.66%]" : ""} ${i === 2 ? "text-paper/90" : ""}`}
                    initial={{ y: "125%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1.5, ease: ease.out, delay: 0.25 + i * 0.12 }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </span>
          </h1>
        </motion.div>

        <div className="frame pb-5 pt-5 md:pb-7">
          <motion.span
            className="block h-px origin-left bg-paper/35"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.8, ease: ease.inOut, delay: 0.6 }}
          />
          <motion.div
            className="grid-12 label items-center pt-4 text-paper/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
          >
            <a
              href="#prologue"
              onClick={(e) => {
                e.preventDefault();
                navigate("/#prologue");
              }}
              className="group col-span-4 flex items-center gap-2 md:col-span-3"
            >
              Explore
              <motion.span
                aria-hidden
                animate={reduced ? undefined : { y: [0, 4, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                ↓
              </motion.span>
            </a>
            <span className="col-span-8 text-right md:col-span-3 md:text-left">
              {site.city} / {site.country}
            </span>
            <Coordinates className="hidden md:col-span-3 md:block" />
            <span className="hidden text-right md:col-span-3 md:block">{site.tagline}</span>
          </motion.div>
        </div>
      </motion.div>

      <PlaceholderNote
        asset={current.image}
        placement="right-[var(--gutter)] top-[calc(var(--header-h)+0.5rem)]"
      />

      {/* Slide progress */}
      <div aria-hidden className="absolute bottom-0 left-0 right-0 h-[2px] bg-paper/10">
        {!reduced && (
          <motion.span
            key={slide}
            className="block h-full origin-left bg-paper/60"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
          />
        )}
      </div>
    </section>
  );
}
