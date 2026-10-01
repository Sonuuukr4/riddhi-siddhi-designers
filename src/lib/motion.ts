import type { Transition, Variants } from "motion/react";

/**
 * Motion vocabulary. Architecture moves slowly and precisely: long
 * decelerating curves, no bounce, small distances.
 */

export const ease = {
  /** Long deceleration — reveals, masks, images. */
  out: [0.16, 1, 0.3, 1] as const,
  /** Symmetric, deliberate — curtains and page transitions. */
  inOut: [0.76, 0, 0.24, 1] as const,
  /** Gentle — hover states and small UI. */
  soft: [0.65, 0, 0.35, 1] as const,
};

export const duration = {
  fast: 0.45,
  base: 0.9,
  slow: 1.4,
};

export const transition = {
  reveal: { duration: duration.slow, ease: ease.out } satisfies Transition,
  base: { duration: duration.base, ease: ease.out } satisfies Transition,
  curtain: { duration: 0.8, ease: ease.inOut } satisfies Transition,
  ui: { duration: duration.fast, ease: ease.soft } satisfies Transition,
};

/** Line slides up from behind its mask. Pair with the `line-mask` utility. */
export const lineReveal: Variants = {
  hidden: { y: "105%" },
  visible: (i: number = 0) => ({
    y: "0%",
    transition: { ...transition.reveal, delay: i * 0.08 },
  }),
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...transition.base, delay: i * 0.06 },
  }),
};

/** Image unveiled by a clip from the bottom edge, with a slow settle in scale. */
export const imageReveal: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)", scale: 1.12 },
  visible: {
    clipPath: "inset(0% 0% 0% 0%)",
    scale: 1,
    transition: { clipPath: { duration: 1.3, ease: ease.inOut }, scale: { duration: 1.8, ease: ease.out } },
  },
};

/** Thin rules that draw across like a pen on a drafting table. */
export const drawX: Variants = {
  hidden: { scaleX: 0 },
  visible: (i: number = 0) => ({ scaleX: 1, transition: { duration: 1.4, ease: ease.inOut, delay: i * 0.1 } }),
};

export const drawY: Variants = {
  hidden: { scaleY: 0 },
  visible: (i: number = 0) => ({ scaleY: 1, transition: { duration: 1.6, ease: ease.inOut, delay: i * 0.12 } }),
};

/** Shared viewport settings — animate once, slightly before fully in view. */
export const inView = { once: true, margin: "0px 0px -12% 0px" } as const;
