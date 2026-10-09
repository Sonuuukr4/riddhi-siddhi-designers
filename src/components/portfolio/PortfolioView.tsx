"use client";

import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { ease } from "@/lib/motion";
import type { PortfolioCategory, Project } from "@/lib/types";
import { cn, pad } from "@/lib/utils";
import { PortfolioCard } from "./PortfolioCard";
import { useCategoryParam } from "./useCategoryParam";

/** Projects shown before "Show more" — keeps large portfolios light on first load. */
const PAGE_SIZE = 10;

export function PortfolioView({ projects, categories }: { projects: Project[]; categories: PortfolioCategory[] }) {
  const [param, setParam] = useCategoryParam();
  const [limit, setLimit] = useState(PAGE_SIZE);
  // Only filter changes made on the page animate; a category arriving from the URL applies instantly.
  const [interacted, setInteracted] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();

  // Only categories that actually contain published work become filters.
  const filters = useMemo(() => categories.filter((c) => c.count > 0), [categories]);
  const active = filters.some((c) => c.slug === param) ? (param as string) : "all";

  const visible = useMemo(
    () => (active === "all" ? projects : projects.filter((p) => p.categorySlug === active)),
    [projects, active],
  );
  const shown = visible.slice(0, limit);
  // Number every project by its position in the full portfolio, so numbers stay stable while filtering.
  const numberOf = (slug: string) => projects.findIndex((p) => p.slug === slug) + 1;

  const choose = (slug: string) => {
    setParam(slug === "all" ? null : slug);
    setLimit(PAGE_SIZE);
    setInteracted(true);
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) scrollTo(el, { offset: -96 });
  };

  if (!projects.length) {
    return (
      <div className="frame py-24">
        <p className="font-serif text-title">New work is being added to the portfolio.</p>
        <p className="label mt-3 text-concrete">Please check back soon.</p>
      </div>
    );
  }

  const options = [{ slug: "all", name: "All", count: projects.length }, ...filters];

  return (
    <div ref={top}>
      {/* Filters */}
      <div className="frame">
        <div className="label mb-3 flex items-baseline justify-between text-concrete">
          <span id="portfolio-filter-label">Filter by category</span>
          <span aria-live="polite">
            {pad(visible.length)} {visible.length === 1 ? "project" : "projects"}
          </span>
        </div>
        <div
          role="group"
          aria-labelledby="portfolio-filter-label"
          className="no-scrollbar -mx-[var(--gutter)] flex gap-x-6 overflow-x-auto border-y border-ink/15 px-[var(--gutter)] md:mx-0 md:flex-wrap md:gap-y-1 md:overflow-visible md:px-0"
        >
          {options.map((c) => {
            const on = c.slug === active;
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={on}
                onClick={() => choose(c.slug)}
                className={cn(
                  "group relative flex min-h-12 shrink-0 items-baseline gap-1.5 py-3 text-lede font-medium uppercase leading-none transition-colors duration-500 condensed",
                  on ? "text-ink" : "text-ink/35 hover:text-ink/70",
                )}
              >
                {c.name}
                <sup className="label text-[0.625rem] font-normal tracking-normal text-concrete">{pad(c.count)}</sup>
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-[2px] origin-left bg-terra transition-transform duration-500 ease-[var(--ease-out-expo)]",
                    on ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Work — re-keyed per category so the new set fades in as one composition. */}
      <motion.div
        key={active}
        className="frame grid-12 mt-14 gap-y-20 md:mt-20 md:gap-y-28"
        initial={interacted ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: ease.out } }}
      >
        {shown.map((p, i) => (
          <PortfolioCard key={p.slug} project={p} index={i} number={numberOf(p.slug)} priority={i < 2} />
        ))}
      </motion.div>

      {visible.length > shown.length && (
        <div className="frame mt-20 flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((n) => n + PAGE_SIZE)}
            className="caps group flex min-h-12 items-center gap-3 border border-ink/30 px-6 transition-colors hover:border-ink hover:bg-ink hover:text-paper"
          >
            Show more
            <span className="label text-concrete transition-colors group-hover:text-paper/70">
              {pad(visible.length - shown.length)} remaining
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
