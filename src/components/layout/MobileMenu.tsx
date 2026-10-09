"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { ContactActions } from "@/components/contact/ContactActions";
import { useUI } from "@/components/providers/UIProvider";
import { Coordinates } from "@/components/ui/Annotations";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { site } from "@/config/site";
import { ease } from "@/lib/motion";
import { pad } from "@/lib/utils";

/**
 * Full-screen navigation for small screens — set like a contents page, with
 * the studio's direct lines in the thumb zone beneath it. Scrolls on short
 * screens rather than shrinking the type.
 */
export function MobileMenu() {
  const { panel, close, open } = useUI();
  const isOpen = panel === "menu";
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isOpen) firstLink.current?.focus({ preventScroll: true });
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="ink-grid fixed inset-0 z-[55] flex flex-col bg-ink text-paper lg:hidden"
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.8, ease: ease.inOut }}
        >
          {/* Scrolls beneath the header line, so long lists never pass under the Close control. */}
          <div
            className="mt-[var(--header-h)] flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
            data-lenis-prevent
          >
            <nav aria-label="Mobile" className="frame flex-1 pt-6">
              <ul className="border-t border-paper/15">
                {site.nav.map((item, i) => (
                  <li key={item.href} className="overflow-hidden border-b border-paper/15">
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.9, ease: ease.out, delay: 0.25 + i * 0.06 }}
                    >
                      <TransitionLink
                        ref={i === 0 ? firstLink : undefined}
                        href={item.href}
                        onClick={close}
                        className="flex items-baseline justify-between py-3.5"
                      >
                        <span className="font-serif text-[clamp(2.5rem,11vw,4.5rem)] leading-none">{item.label}</span>
                        <span className="label text-paper/60">{pad(i + 1)}</span>
                      </TransitionLink>
                    </motion.div>
                  </li>
                ))}
              </ul>
              <motion.button
                type="button"
                onClick={() => open("index")}
                className="caps mt-5 flex items-center gap-2 py-2 text-paper/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Project index →
              </motion.button>
            </nav>

            <motion.div
              className="frame pb-[max(2rem,env(safe-area-inset-bottom))] pt-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.9, ease: ease.out }}
            >
              <p className="label mb-3 text-paper/60">Direct lines</p>
              <ContactActions variant="tiles" />

              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-paper/15 pt-5 text-paper/70">
                <address className="label not-italic leading-relaxed">
                  {site.address.short.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </address>
                <div className="flex flex-col items-end gap-2 text-right">
                  <a
                    href={site.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="caps py-1 text-paper"
                    aria-label="Get directions to the studio (opens Google Maps in a new tab)"
                  >
                    Directions ↗
                  </a>
                  <Coordinates className="text-paper/60" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
