"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ContactActions } from "@/components/contact/ContactActions";
import { useUI } from "@/components/providers/UIProvider";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { ease } from "@/lib/motion";

/** Fields that raise the on-screen keyboard — the bar steps aside while one has focus. */
const TYPING_FIELDS = "input:not([type=radio]):not([type=checkbox]):not([type=hidden]), textarea, select";
const isTypingField = (el: EventTarget | null) => el instanceof Element && el.matches(TYPING_FIELDS);

/**
 * Small screens only: CALL | WHATSAPP, fixed to the bottom edge. It stays out
 * of the way — it arrives once the opening screen has scrolled past, and
 * withdraws over the footer (which carries the same lines), while a
 * full-screen panel is open and while a form field has the keyboard up.
 */
export function MobileActionBar() {
  const { panel } = useUI();
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [overFooter, setOverFooter] = useState(false);
  const [typing, setTyping] = useState(false);

  // A field unmounted by navigation may never report focusout — start each route afresh.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setTyping(false);
  }

  // Arrive after half a screen of scrolling, so no page's opening composition is covered.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > window.innerHeight * 0.5);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setOverFooter(entry.isIntersecting));
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      if (isTypingField(e.target)) setTyping(true);
    };
    const onFocusOut = (e: FocusEvent) => setTyping(isTypingField(e.relatedTarget));
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const hidden = panel !== null || !scrolled || overFooter || typing;

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-[50] border-t border-paper/15 bg-ink/95 pb-[env(safe-area-inset-bottom)] text-paper backdrop-blur-md lg:hidden"
      initial={false}
      animate={{ y: hidden ? "100%" : "0%" }}
      transition={reduced ? { duration: 0 } : { duration: 0.7, ease: ease.out }}
      inert={hidden}
    >
      <nav aria-label="Quick contact">
        <ContactActions variant="bar" include={["call", "whatsapp"]} />
      </nav>
    </motion.div>
  );
}
