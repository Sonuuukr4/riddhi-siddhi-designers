"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ContactActions } from "@/components/contact/ContactActions";
import { useUI } from "@/components/providers/UIProvider";
import { DelhiClock } from "@/components/ui/Annotations";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { useSiteProjects } from "@/components/providers/SiteDataProvider";
import { site } from "@/config/site";
import { ease } from "@/lib/motion";
import { cn, pad } from "@/lib/utils";
import { Wordmark } from "./Logo";

type Theme = "light" | "dark";

/**
 * Transparent over the hero, then a quiet solid bar. The header reads the
 * `data-theme` of whichever section sits beneath it, so its colour always
 * inverts correctly over dark and light sections. Hides while scrolling down.
 *
 * Desktop fits six links, the index, call / WhatsApp and the clock by
 * adding detail as the bar widens: link numbers and the index count from xl,
 * call / WhatsApp labels from 1360px, the Delhi clock from 2xl.
 */
export function Header() {
  const projects = useSiteProjects();
  const { panel, open, close } = useUI();
  const [theme, setTheme] = useState<Theme>("dark");
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const yPos = window.scrollY;
      setSolid(yPos > 24);
      setHidden(yPos > lastY + 2 && yPos > window.innerHeight * 0.6);
      if (yPos < lastY - 2) setHidden(false);
      lastY = yPos;

      const probe = 32;
      const sections = document.querySelectorAll<HTMLElement>("[data-theme]");
      let next: Theme = "light";
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) next = (s.dataset.theme as Theme) ?? "light";
      }
      setTheme(next);
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
  }, []);

  const panelOpen = panel !== null;
  // The menu panel is ink and the index panel is paper: the header takes the colour of whichever is open.
  const dark = panel === "menu" || (!panelOpen && theme === "dark");

  return (
    <motion.header
      className={cn(
        "fixed inset-x-0 top-0 z-[60] transition-colors duration-500",
        dark ? "text-paper" : "text-ink",
        solid && !panelOpen && (dark ? "bg-ink/80 backdrop-blur-md" : "bg-paper/85 backdrop-blur-md"),
        // Over the scrolling index list the header needs its own ground to stay legible.
        panel === "index" && "bg-paper/90 backdrop-blur-md",
      )}
      animate={{ y: hidden && !panelOpen ? "-100%" : "0%" }}
      transition={{ duration: 0.6, ease: ease.out }}
    >
      <div className="frame flex h-[var(--header-h)] items-center justify-between gap-6 lg:gap-5 xl:gap-6">
        <TransitionLink href="/" aria-label={`${site.name} — home`} transitionLabel="Home" className="shrink-0">
          <Wordmark />
        </TransitionLink>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-4 xl:gap-6 2xl:gap-9">
            {site.nav.map((item, i) => (
              <li key={item.href}>
                <TransitionLink href={item.href} className="group relative flex items-start gap-1.5 py-2">
                  <span className="label hidden text-[0.5625rem] opacity-50 xl:inline">{pad(i + 1)}</span>
                  <span className="caps">{item.label}</span>
                  <span className="absolute inset-x-0 bottom-1 h-px origin-right scale-x-0 bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:origin-left group-hover:scale-x-100" />
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-6 lg:gap-4 xl:gap-6">
          <button
            type="button"
            onClick={() => (panel === "index" ? close() : open("index"))}
            aria-expanded={panel === "index"}
            aria-controls="project-index"
            className="caps hidden items-center gap-2 py-2 sm:flex"
          >
            <span aria-hidden className="grid size-3 grid-cols-2 gap-[2px]">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="bg-current" />
              ))}
            </span>
            {panel === "index" ? "Close" : "Index"}
            <span className="label opacity-50 lg:hidden xl:inline">({pad(projects.length)})</span>
          </button>

          <span aria-hidden className="hidden h-3.5 w-px bg-current opacity-25 lg:block" />
          <ContactActions variant="compact" include={["call", "whatsapp"]} className="hidden lg:flex" />

          <div className="label hidden flex-col items-end leading-tight opacity-80 2xl:flex">
            <span>Delhi / India</span>
            <DelhiClock className="opacity-60" />
          </div>

          <button
            type="button"
            onClick={() => (panel === "menu" ? close() : open("menu"))}
            aria-expanded={panel === "menu"}
            aria-controls="mobile-menu"
            className="caps flex items-center gap-3 py-2 lg:hidden"
          >
            <span>{panel === "menu" ? "Close" : "Menu"}</span>
            <span aria-hidden className="relative block h-2.5 w-6">
              <span
                className={cn(
                  "absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500",
                  panel === "menu" && "translate-y-[5px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500",
                  panel === "menu" && "-translate-y-[4px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
