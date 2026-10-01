"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { useFinePointer } from "@/hooks/useMediaQuery";
import { ease } from "@/lib/motion";

type CursorKind = "default" | "link" | "project" | "drag" | "hidden";
type CursorState = { kind: CursorKind; label?: string };

/**
 * Custom cursor for fine pointers only.
 * Elements opt into richer states with data attributes:
 *   data-cursor="project" data-cursor-label="Residential"
 *   data-cursor="drag"
 */
export function Cursor() {
  const fine = useFinePointer();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 45, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 600, damping: 45, mass: 0.35 });
  const [state, setState] = useState<CursorState>({ kind: "default" });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!fine) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest) return;
      const tagged = t.closest<HTMLElement>("[data-cursor]");
      if (tagged) {
        setState({ kind: tagged.dataset.cursor as CursorKind, label: tagged.dataset.cursorLabel });
      } else if (t.closest("input, textarea, select")) {
        setState({ kind: "hidden" });
      } else if (t.closest("a, button, [role='button'], [role='slider'], label")) {
        setState({ kind: "link" });
      } else {
        setState({ kind: "default" });
      }
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [fine, x, y]);

  if (!fine) return null;

  const ringSize = state.kind === "link" ? 44 : 8;
  const showLabel = state.kind === "project" || state.kind === "drag";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
      <motion.div className="absolute left-0 top-0" style={{ x: sx, y: sy }}>
        {/* Dot / ring — difference blend keeps it visible on any surface. */}
        <motion.div
          className="absolute rounded-full border border-white mix-blend-difference"
          animate={{
            width: ringSize,
            height: ringSize,
            x: -ringSize / 2,
            y: -ringSize / 2,
            backgroundColor: state.kind === "link" ? "rgba(255,255,255,0)" : "rgba(255,255,255,1)",
            opacity: visible && !showLabel && state.kind !== "hidden" ? 1 : 0,
          }}
          transition={{ duration: 0.35, ease: ease.out }}
        />
        <AnimatePresence>
          {showLabel && visible && (
            <motion.div
              key={state.kind}
              className="absolute -left-[3.25rem] -top-[3.25rem] flex size-[6.5rem] flex-col items-center justify-center rounded-full bg-paper text-ink"
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.2, opacity: 0 }}
              transition={{ duration: 0.45, ease: ease.out }}
            >
              {state.kind === "project" ? (
                <>
                  <span className="label text-[0.625rem] text-concrete">{state.label ?? "Project"}</span>
                  <span className="mt-1 text-[0.8125rem] font-medium uppercase tracking-[0.12em]">View →</span>
                </>
              ) : (
                <span className="text-[0.75rem] font-medium uppercase tracking-[0.14em]">← Drag →</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
