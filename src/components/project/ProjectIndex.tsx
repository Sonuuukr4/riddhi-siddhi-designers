"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Img } from "@/components/ui/Img";
import { PlaceholderNote } from "@/components/ui/ParallaxImage";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { useSiteProjects } from "@/components/providers/SiteDataProvider";
import { ease } from "@/lib/motion";
import { cn, orDash, pad } from "@/lib/utils";

/**
 * Editorial index of all projects. Hovering (or focusing) a row previews its
 * image in a fixed frame; on touch screens each row carries a thumbnail.
 */
export function ProjectIndex({ onNavigate, tone = "light" }: { onNavigate?: () => void; tone?: "light" | "dark" }) {
  const projects = useSiteProjects();
  const [active, setActive] = useState(projects[0]?.slug ?? "");
  const previewRef = useRef<HTMLDivElement>(null);
  const current = projects.find((p) => p.slug === active) ?? projects[0];
  if (!current) {
    return <p className="label text-concrete">New projects are being added to the portfolio.</p>;
  }
  const muted = tone === "dark" ? "text-paper/60" : "text-concrete";
  const border = tone === "dark" ? "border-paper/15" : "border-ink/15";

  return (
    <div className="grid-12 items-start">
      <ol className={cn("col-span-12 border-t lg:col-span-7", border)}>
        {projects.map((p, i) => {
          const isActive = p.slug === active;
          return (
            <li key={p.slug} className={cn("border-b", border)}>
              <TransitionLink
                href={`/projects/${p.slug}`}
                transitionLabel={p.category}
                imageRef={isActive ? previewRef : undefined}
                image={p.heroImage}
                onClick={onNavigate}
                onMouseEnter={() => setActive(p.slug)}
                onFocus={() => setActive(p.slug)}
                className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 py-4 sm:grid-cols-[3.5rem_1fr_auto] sm:py-5 lg:py-6"
                data-cursor="project"
                data-cursor-label={p.category}
              >
                <span className={cn("label self-start pt-2", muted)}>{pad(i + 1)}</span>
                <span className="flex min-w-0 items-center gap-4">
                  <span className="relative block aspect-[4/3] w-20 shrink-0 overflow-hidden lg:hidden">
                    <Img asset={p.heroImage} alt="" fill sizes="80px" className="tone object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block font-serif text-[clamp(2rem,5.2vw,4.75rem)] leading-[0.95] transition-all duration-700 ease-[var(--ease-out-expo)]",
                        "lg:group-hover:translate-x-3 lg:group-hover:italic",
                        !isActive && "lg:opacity-55",
                      )}
                    >
                      {p.category}
                    </span>
                    <span className={cn("label mt-1 block", muted)}>
                      {p.typology} · {orDash(p.location)}
                    </span>
                  </span>
                </span>
                <span
                  aria-hidden
                  className="text-xl transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
                >
                  →
                </span>
              </TransitionLink>
            </li>
          );
        })}
      </ol>

      <div className="relative col-span-4 col-start-9 hidden lg:block">
        <div className="sticky top-[calc(var(--header-h)+2rem)]">
          <div ref={previewRef} className="relative aspect-[4/5] overflow-hidden bg-graphite">
            <AnimatePresence initial={false}>
              <motion.div
                key={current.slug}
                className="absolute inset-0"
                initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.3 } }}
                transition={{ duration: 0.8, ease: ease.inOut }}
              >
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.4, ease: ease.out }}
                >
                  <Img asset={current.heroImage} fill sizes="34vw" className="tone object-cover" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
            <PlaceholderNote asset={current.heroImage} />
          </div>
          <div className={cn("label mt-3 flex justify-between", muted)}>
            <span>
              Fig. {pad(projects.indexOf(current) + 1)} — {current.category}
            </span>
            <span>{current.placeholder ? "Placeholder" : orDash(current.status)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
