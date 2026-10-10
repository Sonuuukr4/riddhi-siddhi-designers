"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ElementType, type ReactNode } from "react";
import { drawX, fadeUp, inView, lineReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

type RevealLinesProps = {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  /** Extra classes for each clipping mask, e.g. room for an italic descender at the left edge. */
  maskClassName?: string;
  /** Delay before the first line, in seconds. */
  delay?: number;
  /** Animate immediately instead of waiting for the element to enter view. */
  immediate?: boolean;
};

/**
 * Text that rises line by line from behind a mask — the primary typographic
 * motion of the site. Each entry in `lines` is one visual line.
 */
export function RevealLines({
  lines,
  as: Tag = "div",
  className,
  lineClassName,
  maskClassName,
  delay = 0,
  immediate,
}: RevealLinesProps) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, inView);
  const show = immediate || seen;

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className={cn("line-mask", maskClassName)}>
          <motion.span
            className={cn("block will-change-transform", lineClassName)}
            variants={lineReveal}
            initial="hidden"
            animate={show ? "visible" : "hidden"}
            custom={i + delay / 0.08}
          >
            {line}
            {/* Keeps words apart for assistive tech when lines are read as one heading. */}{" "}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

const motionTags = { div: motion.div, p: motion.p, li: motion.li, span: motion.span, figure: motion.figure };

/** Generic fade-and-rise wrapper for blocks of copy or UI. */
export function FadeIn({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: keyof typeof motionTags;
}) {
  const MotionTag = motionTags[as];
  return (
    <MotionTag
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      custom={delay / 0.06}
    >
      {children}
    </MotionTag>
  );
}

/** A hairline that draws across when it enters view. */
export function Rule({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.span
      aria-hidden
      className={cn("block h-px origin-left bg-current/25", className)}
      variants={drawX}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      custom={delay / 0.1}
    />
  );
}
