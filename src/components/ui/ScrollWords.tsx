"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A statement whose words brighten one by one as it scrolls through the
 * viewport — reading pace set by the reader's own scroll.
 */
export function ScrollWords({
  text,
  className,
  emphasis = [],
}: {
  text: string;
  className?: string;
  /** Words (exact match, punctuation stripped) to set in italic. */
  emphasis?: string[];
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = text.split(" ");

  return (
    <p ref={ref} className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => (
        <Word
          key={i}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
          still={!!reduced}
          italic={emphasis.includes(word.replace(/[^\p{L}]/gu, ""))}
        >
          {word}
        </Word>
      ))}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
  still,
  italic,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  still: boolean;
  italic: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span className={cn("mr-[0.24em]", italic && "italic")} style={{ opacity: still ? 1 : opacity }}>
      {children}
    </motion.span>
  );
}
