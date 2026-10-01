"use client";

import Lenis from "lenis";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

type SmoothScrollContextValue = {
  /** Scrolls to an element, selector or offset — smoothly when Lenis is active. */
  scrollTo: (target: string | HTMLElement | number, options?: { immediate?: boolean; offset?: number }) => void;
  /** Freeze page scrolling (reference-counted, so overlapping owners are safe). */
  lock: () => void;
  unlock: () => void;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null);

/**
 * Lenis smooth scrolling for wheel input. Touch devices keep native scrolling,
 * and users who prefer reduced motion get the browser default entirely.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const lenis = useRef<Lenis | null>(null);
  const locks = useRef(0);

  useEffect(() => {
    if (reduced) return;
    // Anchor links are routed through the page-transition layer instead (see TransitionProvider).
    const instance = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, autoRaf: true });
    lenis.current = instance;
    if (locks.current > 0) instance.stop();
    return () => {
      instance.destroy();
      lenis.current = null;
    };
  }, [reduced]);

  const scrollTo = useCallback<SmoothScrollContextValue["scrollTo"]>(
    (target, options = {}) => {
      const offset = options.offset ?? 0;
      const instance = lenis.current;
      if (instance) {
        // Re-measure first: after a route change Lenis may still hold the previous page's height.
        instance.resize();
        instance.scrollTo(target, { offset, immediate: options.immediate, force: true, duration: 1.6 });
        return;
      }
      const behavior: ScrollBehavior = options.immediate || reduced ? "auto" : "smooth";
      if (typeof target === "number") {
        window.scrollTo({ top: target + offset, behavior });
        return;
      }
      const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior });
    },
    [reduced],
  );

  const lock = useCallback(() => {
    locks.current += 1;
    lenis.current?.stop();
    document.documentElement.style.overflow = "hidden";
  }, []);

  const unlock = useCallback(() => {
    locks.current = Math.max(0, locks.current - 1);
    if (locks.current > 0) return;
    lenis.current?.start();
    document.documentElement.style.overflow = "";
  }, []);

  const value = useMemo(() => ({ scrollTo, lock, unlock }), [scrollTo, lock, unlock]);

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}

export function useSmoothScroll() {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) throw new Error("useSmoothScroll must be used inside SmoothScrollProvider");
  return ctx;
}
