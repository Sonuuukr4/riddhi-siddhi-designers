"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Img } from "@/components/ui/Img";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { ease } from "@/lib/motion";
import type { ImageAsset } from "@/lib/types";
import { useSmoothScroll } from "./SmoothScroll";

type Rect = { top: number; left: number; width: number; height: number };

type Overlay =
  | { kind: "curtain"; phase: "cover" | "reveal"; label?: string }
  | { kind: "image"; phase: "expand" | "hold" | "fade"; rect: Rect; lowSrc: string; image: ImageAsset };

export type NavigateOptions = {
  /** Short destination label shown on the curtain, e.g. "Index of work". */
  label?: string;
  /** Element containing the clicked image; it expands to fill the screen. */
  fromImage?: HTMLElement | null;
  /** The destination hero image (rendered full-bleed on the next page). */
  image?: ImageAsset;
};

type TransitionContextValue = {
  navigate: (href: string, options?: NavigateOptions) => void;
  /** Called by a destination hero once its image has loaded. */
  markHeroReady: () => void;
  isTransitioning: boolean;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

/**
 * Page transitions for the App Router.
 *
 * - Curtain: an ink panel rises, the route changes underneath, the panel lifts.
 * - Image: the clicked project image expands to cover the viewport, the route
 *   changes to the project page (whose hero is the same image), then fades.
 *
 * Same-page anchors simply scroll. Reduced motion skips all of it.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const { scrollTo, lock, unlock } = useSmoothScroll();

  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  useEffect(() => {
    overlayRef.current = overlay;
  }, [overlay]);

  const pending = useRef<{ href: string; hash: string } | null>(null);
  const covered = useRef(false);
  const active = useRef(false);
  const heroLoaded = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToHash = useCallback(
    (hash: string, immediate = false) => {
      const el = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      if (el) scrollTo(el, { immediate });
      else scrollTo(0, { immediate: true });
    },
    [scrollTo],
  );

  const navigate = useCallback<TransitionContextValue["navigate"]>(
    (href, options = {}) => {
      const url = new URL(href, window.location.href);

      if (url.pathname === window.location.pathname) {
        if (url.hash) {
          history.replaceState(null, "", url.hash);
          scrollToHash(url.hash);
        } else {
          scrollTo(0);
        }
        return;
      }

      if (reduced || overlayRef.current) {
        router.push(href);
        return;
      }

      pending.current = { href: url.pathname + url.search, hash: url.hash };
      heroLoaded.current = false;
      covered.current = false;
      active.current = true;
      lock();

      const imgEl = options.fromImage?.querySelector("img");
      if (options.fromImage && options.image && imgEl) {
        const r = options.fromImage.getBoundingClientRect();
        setOverlay({
          kind: "image",
          phase: "expand",
          rect: { top: r.top, left: r.left, width: r.width, height: r.height },
          lowSrc: imgEl.currentSrc || imgEl.src,
          image: options.image,
        });
      } else {
        setOverlay({ kind: "curtain", phase: "cover", label: options.label });
      }
    },
    [reduced, router, lock, scrollTo, scrollToHash],
  );

  /** The screen is covered — swap the route underneath. */
  const onCovered = useCallback(() => {
    const target = pending.current;
    if (!target || covered.current) return;
    covered.current = true;
    router.push(target.href + target.hash, { scroll: false });
  }, [router]);

  const finish = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    setOverlay(null);
    pending.current = null;
    unlock();
  }, [unlock]);

  const fadeImage = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    setOverlay((o) => (o && o.kind === "image" && o.phase === "hold" ? { ...o, phase: "fade" } : o));
  }, []);

  // New route committed while covered: reset scroll, then reveal.
  useEffect(() => {
    const current = overlayRef.current;
    const target = pending.current;
    if (!current || !target || pathname !== target.href.split("?")[0]) return;

    window.scrollTo(0, 0);
    if (target.hash) {
      // Jump to the anchor on the next task, once the new page has laid out.
      setTimeout(() => scrollToHash(target.hash, true), 0);
    } else {
      scrollTo(0, { immediate: true });
    }

    if (current.kind === "curtain") {
      setOverlay({ ...current, phase: "reveal" });
    } else {
      setOverlay({ ...current, phase: "hold" });
      holdTimer.current = setTimeout(fadeImage, heroLoaded.current ? 120 : 1100);
    }
  }, [pathname, scrollTo, scrollToHash, fadeImage]);

  // Safety net: navigation must never hinge on an animation completing
  // (background tabs pause animation frames; animations can be interrupted).
  const phase = overlay?.phase;
  useEffect(() => {
    if (phase === "cover" || phase === "expand") {
      const t = setTimeout(onCovered, 1500);
      return () => clearTimeout(t);
    }
    if (phase === "reveal" || phase === "fade") {
      const t = setTimeout(finish, 1200);
      return () => clearTimeout(t);
    }
  }, [phase, onCovered, finish]);

  const markHeroReady = useCallback(() => {
    heroLoaded.current = true;
    if (overlayRef.current?.kind === "image" && overlayRef.current.phase === "hold") {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      holdTimer.current = setTimeout(fadeImage, 120);
    }
  }, [fadeImage]);

  useEffect(
    () => () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    },
    [],
  );

  const value = useMemo(
    () => ({ navigate, markHeroReady, isTransitioning: overlay !== null }),
    [navigate, markHeroReady, overlay],
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {overlay?.kind === "curtain" && (
          <Curtain
            key="curtain"
            phase={overlay.phase}
            label={overlay.label}
            onCovered={onCovered}
            onRevealed={finish}
          />
        )}
        {overlay?.kind === "image" && (
          <ImageExpand key="image" overlay={overlay} onCovered={onCovered} onFaded={finish} />
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}

function Curtain({
  phase,
  label,
  onCovered,
  onRevealed,
}: {
  phase: "cover" | "reveal";
  label?: string;
  onCovered: () => void;
  onRevealed: () => void;
}) {
  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink text-paper"
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      animate={phase === "cover" ? { clipPath: "inset(0% 0% 0% 0%)" } : { clipPath: "inset(0% 0% 100% 0%)" }}
      transition={{ duration: 0.75, ease: ease.inOut }}
      onAnimationComplete={() => (phase === "cover" ? onCovered() : onRevealed())}
    >
      <div className="flex w-[min(28rem,80vw)] flex-col gap-3">
        <motion.span
          className="block h-px origin-left bg-paper/40"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: ease.inOut, delay: 0.15 }}
        />
        <div className="label flex justify-between text-paper/60">
          <span>Riddhi Siddhi</span>
          <span>{label ?? "New Delhi"}</span>
        </div>
      </div>
    </motion.div>
  );
}

function ImageExpand({
  overlay,
  onCovered,
  onFaded,
}: {
  overlay: Extract<Overlay, { kind: "image" }>;
  onCovered: () => void;
  onFaded: () => void;
}) {
  const { rect, phase } = overlay;
  const full = useMemo(
    () => ({ top: 0, left: 0, width: document.documentElement.clientWidth, height: window.innerHeight }),
    [],
  );

  return (
    <motion.div
      aria-hidden
      className="fixed z-[80] overflow-hidden bg-ink"
      initial={{ ...rect, opacity: 1 }}
      animate={phase === "fade" ? { ...full, opacity: 0 } : { ...full, opacity: 1 }}
      transition={
        phase === "fade" ? { opacity: { duration: 0.6, ease: ease.soft } } : { duration: 0.95, ease: ease.inOut }
      }
      onAnimationComplete={() => {
        if (phase === "expand") onCovered();
        if (phase === "fade") onFaded();
      }}
    >
      {/* Already-decoded thumbnail sits underneath so there is never a blank frame. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={overlay.lowSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: overlay.image.position }}
      />
      <Img asset={overlay.image} alt="" fill sizes="100vw" priority className="tone object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/60" />
    </motion.div>
  );
}

export function usePageTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("usePageTransition must be used inside TransitionProvider");
  return ctx;
}
