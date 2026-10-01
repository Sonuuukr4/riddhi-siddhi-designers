"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { ProjectIndex } from "@/components/project/ProjectIndex";
import { useUI } from "@/components/providers/UIProvider";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { projects } from "@/content/projects";
import { ease } from "@/lib/motion";
import { pad } from "@/lib/utils";

/** The INDEX panel: a contents page for the portfolio, opened from anywhere. */
export function IndexOverlay() {
  const { panel, close } = useUI();
  const isOpen = panel === "index";
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const node = panelRef.current;
    const t = setTimeout(() => node?.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true }), 400);
    return () => clearTimeout(t);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="project-index"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Project index"
          className="paper-grid fixed inset-0 z-[55] overflow-y-auto bg-paper text-ink"
          data-lenis-prevent
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(100% 0% 0% 0%)" }}
          transition={{ duration: 0.85, ease: ease.inOut }}
        >
          <div className="frame pb-16 pt-[calc(var(--header-h)+2.5rem)] lg:pt-[calc(var(--header-h)+4rem)]">
            <motion.div
              className="mb-10 flex items-end justify-between gap-6 lg:mb-14"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: ease.out, delay: 0.35 }}
            >
              <div>
                <p className="label text-concrete">Index — {pad(projects.length)} entries</p>
                <h2 className="mt-3 text-headline font-medium uppercase condensed">Index of work</h2>
              </div>
              <div className="flex flex-col items-end gap-3">
                <button type="button" onClick={close} className="caps py-2">
                  Close ✕
                </button>
                <TransitionLink
                  href="/projects"
                  onClick={close}
                  transitionLabel="Index of work"
                  className="caps hidden py-2 text-concrete underline-offset-4 hover:underline sm:block"
                >
                  Open as page →
                </TransitionLink>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.45 }}>
              <ProjectIndex onNavigate={close} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
