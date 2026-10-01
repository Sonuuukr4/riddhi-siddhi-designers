"use client";

import { motion, useInView, useScroll, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { forwardRef, useImperativeHandle, useRef, type ReactNode } from "react";
import { site } from "@/content/site";
import { imageReveal, inView } from "@/lib/motion";
import type { ImageAsset } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Img } from "./Img";

type ParallaxImageProps = {
  asset: ImageAsset;
  sizes: string;
  className?: string;
  imageClassName?: string;
  /** Vertical drift as a fraction of the image height. 0 disables parallax. */
  strength?: number;
  reveal?: boolean;
  priority?: boolean;
  /** Show the "representative image" note on placeholder assets. */
  note?: boolean;
  children?: ReactNode;
};

/**
 * A framed image that reveals with a clip and drifts gently against the
 * scroll. The frame (className) sets size/aspect; the image always covers it.
 */
export const ParallaxImage = forwardRef<HTMLDivElement, ParallaxImageProps>(function ParallaxImage(
  { asset, sizes, className, imageClassName, strength = 0.08, reveal = true, priority, note = true, children },
  forwardedRef,
) {
  const ref = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement);
  const reduced = usePrefersReducedMotion();
  // Observe the unclipped frame: an element hidden by its own clip-path never registers as in view.
  const seen = useInView(ref, inView);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-strength * 100}%`, `${strength * 100}%`]);
  const overscan = `${Math.ceil(strength * 130) + 2}%`;

  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-paper-deep", className)}>
      <motion.div
        className="absolute inset-0"
        variants={imageReveal}
        initial={reveal ? "hidden" : false}
        animate={!reveal || seen ? "visible" : "hidden"}
      >
        <motion.div
          className="absolute inset-x-0"
          style={{ top: `-${overscan}`, bottom: `-${overscan}`, y: reduced || !strength ? 0 : y }}
        >
          <Img
            asset={asset}
            fill
            sizes={sizes}
            priority={priority}
            className={cn("object-cover", imageClassName ?? "tone")}
          />
        </motion.div>
      </motion.div>
      {note && <PlaceholderNote asset={asset} />}
      {children}
    </div>
  );
});

/** Small drawing-style note marking stock imagery, so it is never mistaken for studio work. */
export function PlaceholderNote({
  asset,
  className,
  placement = "bottom-2 right-2",
}: {
  asset: ImageAsset;
  className?: string;
  /** Position utilities; kept separate from className so they never conflict. */
  placement?: string;
}) {
  if (!asset.placeholder || !site.showPlaceholderNotices) return null;
  return (
    <span
      className={cn(
        "label pointer-events-none absolute z-10 bg-ink/55 px-1.5 py-0.5 text-[0.5625rem] text-paper/80 backdrop-blur-sm",
        placement,
        className,
      )}
    >
      Representative image
    </span>
  );
}
